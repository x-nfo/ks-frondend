import { useState, useEffect } from 'react';
import {
    useLoaderData,
    useOutletContext,
    useActionData,
    useNavigation,
    useRouteError,
    isRouteErrorResponse,
    redirect,
    data
} from 'react-router';
import type { Route } from './+types/checkout._index';
import type { OutletContext } from '~/types';
import { CurrencyCode, SortOrder } from '~/generated/graphql';
import {
    getAvailableCountries,
    getEligibleShippingMethods,
    getEligiblePaymentMethods,
    addPaymentToOrder,
    transitionOrderToState,
    getNextOrderStates,
} from '~/providers/checkout/checkout';
import { getOrderByCode, getActiveOrder } from '~/providers/orders/order';
import { getSession, commitSession } from '~/sessions';
import { getActiveCustomerAddresses, getActiveCustomerOrderList } from '~/providers/customer/customer';
import { CheckoutProvider, useCheckout } from '~/components/checkout/CheckoutProvider';
import { ContactStep } from '~/components/checkout/steps/ContactStep';
import { ShippingAddressStep } from '~/components/checkout/steps/ShippingAddressStep';
import { DeliveryStep } from '~/components/checkout/steps/DeliveryStep';
import { PaymentStep } from '~/components/checkout/steps/PaymentStep';
import { OrderSummary } from '~/components/checkout/OrderSummary';
import { PaymentInstructions } from '~/components/checkout/midtrans/PaymentInstructions';
import type { MidtransPaymentData } from '~/components/checkout/midtrans/types';

import { CheckCircleIcon } from '@heroicons/react/24/solid';

export async function loader({ request, context }: Route.LoaderArgs) {
    const apiUrl = (context?.cloudflare?.env as any)?.VENDURE_API_URL || process.env.VENDURE_API_URL || 'http://localhost:3000/shop-api';
    const opts = { request, apiUrl };
    const activeOrder = await getActiveOrder(opts);

    // FIX: If activeOrder is null, it might be because the order was just placed/authorized
    // and is no longer "active". We should check if there's a recent order for this customer
    // or session before redirecting to home.
    if (!activeOrder || activeOrder.lines.length === 0) {
        // Try to find the most recent order for the logged-in customer
        try {
            const orderList = await getActiveCustomerOrderList({
                take: 1,
                sort: { updatedAt: SortOrder.Desc }
            }, opts);

            const latestOrder = orderList?.activeCustomer?.orders?.items?.[0];
            if (latestOrder && latestOrder.orderPlacedAt) {
                const now = new Date();
                // The activeCustomerOrderList query does not return updatedAt, so we use orderPlacedAt
                const orderTime = new Date(latestOrder.orderPlacedAt);
                const diffMinutes = (now.getTime() - orderTime.getTime()) / 1000 / 60;

                // If updated within last 10 minutes and in a valid post-checkout state
                const validStates = ['PaymentAuthorized', 'PaymentSettled', 'PartiallySettled', 'ArrangingPayment'];
                if (diffMinutes < 10 && validStates.includes(latestOrder.state)) {
                    return redirect(`/checkout/confirmation/${latestOrder.code}`);
                }
            }
        } catch (e) {
            console.error("Error checking recent orders:", e);
        }

        // If we still can't find an order, we don't strictly redirect to Home if we are in a transition.
        // However, if the user directly navigates here with empty cart, they usually expect a redirect or empty state.
        // We will return activeOrder as null and handle it in the UI to avoid the jarring redirect loop.
        // return redirect('/'); 
    }

    // If order is not active but has been placed (e.g. ArrangingPayment or beyond), 
    // we should let it through if we are currently in the checkout flow, 
    // or redirect to confirmation if it's already completed.
    if (activeOrder && !activeOrder.active) {
        const completedStates = ['PaymentAuthorized', 'PaymentSettled', 'PartiallySettled'];
        if (completedStates.includes(activeOrder.state)) {
            return redirect(`/checkout/confirmation/${activeOrder.code}`);
        }
        // If it's in another state (like Shipped), redirect to home or history
        if (activeOrder.state !== 'ArrangingPayment' && activeOrder.state !== 'AddingItems') {
            return redirect('/');
        }
    }

    const { availableCountries } = await getAvailableCountries(opts);
    const { eligibleShippingMethods } = await getEligibleShippingMethods(opts);
    const { eligiblePaymentMethods } = await getEligiblePaymentMethods(opts);
    const addressesData = await getActiveCustomerAddresses(opts);
    const addresses = addressesData?.activeCustomer?.addresses ?? [];
    const session = await getSession(request.headers.get("Cookie"));
    const error = session.get('activeOrderError');

    const headers = new Headers();
    if (error) {
        headers.append("Set-Cookie", await commitSession(session));
    }

    return data({
        activeOrder,
        availableCountries,
        eligibleShippingMethods,
        eligiblePaymentMethods,
        addresses,
        activeCustomer: addressesData?.activeCustomer,
        error,
    }, { headers });
}

export const action = async ({ request }: Route.ActionArgs) => {
    const body = await request.formData();
    const action = body.get('action');

    if (action === 'completeOrder') {
        const paymentMethodCode = body.get('paymentMethodCode');
        const midtransMetadata = body.get('midtransMetadata');

        if (typeof paymentMethodCode === 'string') {
            const orderToCheck = await getActiveOrder({ request });
            if (!orderToCheck) {
                return data({ error: 'No active order found' }, { status: 400 });
            }

            if (!orderToCheck.customer) {
                return data({ error: 'Customer information is missing' }, { status: 400 });
            }
            if (!orderToCheck.shippingAddress?.streetLine1) {
                return data({ error: 'Shipping address is missing' }, { status: 400 });
            }
            if (!orderToCheck.shippingLines?.length) {
                return data({ error: 'Shipping method Not selected' }, { status: 400 });
            }

            if (orderToCheck.state === 'AddingItems') {
                const { nextOrderStates } = await getNextOrderStates({ request });
                if (nextOrderStates.includes('ArrangingPayment')) {
                    const transitionResult = await transitionOrderToState(
                        'ArrangingPayment',
                        { request },
                    );
                    if ((transitionResult.transitionOrderToState as any)?.__typename !== 'Order') {
                        return data({ error: (transitionResult.transitionOrderToState as any)?.message || 'Failed to transition to ArrangingPayment' }, { status: 400 });
                    }
                }
            }

            let metadata: Record<string, any> = {};
            if (midtransMetadata && typeof midtransMetadata === 'string') {
                try {
                    metadata = { ...metadata, ...JSON.parse(midtransMetadata) };
                } catch (e) {
                    // Ignore parse errors
                }
            }

            const result = await addPaymentToOrder(
                { method: paymentMethodCode, metadata },
                { request },
            );

            if (result.addPaymentToOrder.__typename === 'Order') {
                const order = result.addPaymentToOrder;
                let payment = order.payments?.[order.payments.length - 1];

                const getPaymentData = (p: any) => {
                    if (p?.metadata && Object.keys(p.metadata).length > 0) {
                        return p.metadata;
                    }
                    return null;
                };

                let paymentData = getPaymentData(payment);

                if (payment && !paymentData) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    try {
                        const refetchedOrder = await getOrderByCode(order.code, { request });
                        if (refetchedOrder) {
                            const refetchedPayment = refetchedOrder.payments?.[refetchedOrder.payments.length - 1];
                            if (refetchedPayment) {
                                paymentData = getPaymentData(refetchedPayment);
                            }
                        }
                    } catch (err) {
                        console.error('Error refetching order:', err);
                    }
                }

                return redirect(`/checkout/confirmation/${order.code}`);
            } else {
                return data(
                    { error: (result.addPaymentToOrder as any)?.message || 'Payment failed' },
                    { status: 400 },
                );
            }
        }
    }
    return data({ success: true });
};

function CheckoutContent() {
    const { error } = useLoaderData<typeof loader>();
    const { applyCoupon, removeCoupon } = useOutletContext<OutletContext>();
    const actionData = useActionData<typeof action>();
    const { activeOrder, activeOrderFetcher, paymentData, setPaymentData } = useCheckout();

    const [orderCode, setOrderCode] = useState<string | null>(null);

    useEffect(() => {
        const data = actionData as any;
        if (data?.success && data?.paymentData) {
            setPaymentData(data.paymentData as MidtransPaymentData);
            setOrderCode(data.orderCode);
            if (activeOrderFetcher.state === 'idle') {
                activeOrderFetcher.load('/api/active-order');
            }
        }
    }, [actionData, activeOrderFetcher, setPaymentData]);

    const shippingCost = (activeOrder?.shippingWithTax ?? 0);
    const orderTotal = activeOrder?.totalWithTax ?? 0;

    if (!activeOrder) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <div className="mb-6">
                    <h1 className="text-3xl font-serif font-medium text-karima-brand mb-4">Your Cart is Empty</h1>
                    <p className="text-karima-ink/70 mb-8">It looks like you don't have any items in your checkout.</p>
                    <a href="/" className="inline-block bg-karima-brand text-white px-8 py-3 rounded-none uppercase tracking-widest text-xs font-bold hover:opacity-90 transition-opacity">
                        Continue Shopping
                    </a>
                </div>
            </div>
        );
    }

    return (

        <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:col-span-12 mb-8">
                <h1 className="text-5xl font-serif font-bold text-karima-brand"> <a href="/">Karima Syar'i</a></h1>
            </div>
            {/* LEFT COLUMN: Steps */}
            <div className="lg:col-span-6 flex flex-col order-2 lg:order-1">
                <ContactStep />
                <ShippingAddressStep />
                <DeliveryStep />
                <PaymentStep />
            </div>

            {/* RIGHT COLUMN: Summary */}
            <div className="lg:col-span-6 mt-0 lg:mt-0 mb-10 lg:mb-0 order-1 lg:order-2">
                <div className="lg:sticky lg:top-10">
                    <OrderSummary
                        lines={activeOrder?.lines as any ?? []}
                        subTotal={activeOrder?.subTotalWithTax ?? 0}
                        shippingCost={shippingCost}
                        total={orderTotal}
                        currencyCode={activeOrder?.currencyCode ?? CurrencyCode.Idr}
                        activeOrder={activeOrder}
                        activeOrderFetcher={activeOrderFetcher}
                        applyCoupon={applyCoupon}
                        removeCoupon={removeCoupon}
                        error={error}
                    />


                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    const data = useLoaderData<typeof loader>();
    const {
        activeOrder: outletOrder, // Renaming to avoid conflict if we use it directly
        activeOrderFetcher,
        applyCoupon,
        removeCoupon
    } = useOutletContext<OutletContext>();

    // Priority: outletOrder (live updates) > loader data
    const activeOrder = outletOrder || data.activeOrder;

    return (
        <div className="pt-8 lg:pt-12 bg-white min-h-screen text-karima-ink font-sans">

            <main className="pt-16">
                <CheckoutProvider
                    activeOrder={activeOrder}
                    activeCustomer={data.activeCustomer as any}
                    eligibleShippingMethods={data.eligibleShippingMethods as any}
                    eligiblePaymentMethods={data.eligiblePaymentMethods as any}
                    availableCountries={data.availableCountries as any}
                >
                    <CheckoutContent />
                </CheckoutProvider>
            </main>
        </div>
    );
}

export function ErrorBoundary() {
    const error = useRouteError();
    console.error("💥 CHECKOUT PAGE ERROR:", error);

    return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 border border-gray-100 text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <h1 className="text-2xl font-black font-display text-gray-900 mb-2 uppercase tracking-tight">Terjadi Kesalahan</h1>
                <p className="text-sm font-medium text-gray-500 mb-8 italic">Kami menemui kendala saat memuat halaman checkout.</p>

                {isRouteErrorResponse(error) ? (
                    <div className="bg-gray-50 rounded-xl p-4 mb-8">
                        <p className="text-xs font-black text-gray-400 uppercase mb-1">{error.status} {error.statusText}</p>
                        <p className="text-sm font-bold text-gray-700">{error.data}</p>
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left overflow-auto max-h-40">
                        <p className="text-[10px] font-mono text-red-800 break-words">{(error as any)?.message || 'Unknown Error'}</p>
                    </div>
                )}

                <a href="/checkout" className="w-full bg-gray-900 hover:bg-black text-white py-4 px-6 rounded-xl shadow-xl transition-all text-sm font-black uppercase tracking-widest inline-block text-center">
                    Coba Lagi
                </a>
            </div>
        </div>
    );
}
