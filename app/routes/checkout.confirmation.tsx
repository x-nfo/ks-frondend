import { getOrderByCode } from '~/providers/orders/order';
import { useLoaderData, useRevalidator, useNavigate, useRouteLoaderData } from 'react-router';
import type { Route } from './+types/checkout.confirmation';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { PaymentInstructions } from '~/components/checkout/midtrans/PaymentInstructions';
import type { MidtransPaymentData } from '~/components/checkout/midtrans/types';


export async function loader({ params, request, context }: Route.LoaderArgs) {
    const kv = context.cloudflare?.env?.KV_CACHE;
    const options = { request, kv };
    const orderCode = (params as any).orderCode;
    if (!orderCode) throw new Error("Order code missing");

    try {
        const order = await getOrderByCode(orderCode, options);

        // Try to fetch specific Midtrans data using the custom query if it's not in the order already
        let paymentMetadata: MidtransPaymentData | null = null;

        // 1. Try to find in existing payments - take the LATEST one
        // We look for any payment that has metadata indicating it's from Midtrans
        const payments = order?.payments || [];
        // Reverse to get latest first
        const midtransPayment = [...payments].reverse().find(p => {
            if (!p.metadata) return false;
            // Check for common Midtrans fields in metadata
            const meta = p.metadata as any;
            return meta.paymentType || meta.payment_type || meta.transactionId || meta.transaction_id;
        });

        if (midtransPayment?.metadata) {
            paymentMetadata = midtransPayment.metadata as any;
        }

        // 2. Fallback: Fetch via custom GraphQL query if possible OR if the found metadata seems incomplete
        // This is useful if the webhook updated the order but the initial `getOrderByCode` didn't catch it yet (race condition)
        // or if we need fresh status
        if (order) {
            try {
                const apiUrl = process.env.VENDURE_API_URL || 'http://localhost:3000/shop-api';
                const query = `query($code: String!) { midtransPaymentData(orderCode: $code) }`;
                const res = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query, variables: { code: order.code } })
                });

                if (res.ok) {
                    const json = (await res.json()) as any;
                    const metadataString = json.data?.midtransPaymentData;
                    if (metadataString) {
                        try {
                            const freshMetadata = JSON.parse(metadataString);
                            // If we found fresh metadata, use it as it might have newer status
                            if (freshMetadata && (freshMetadata.transactionId || freshMetadata.transaction_id)) {
                                paymentMetadata = freshMetadata;
                            }
                        } catch (e) {
                            console.error('Failed to parse fresh metadata JSON', e);
                        }
                    }
                }
            } catch (e) {
                console.error('Failed to fetch Midtrans payment data via custom query:', e);
            }
        }

        return {
            order,
            paymentMetadata,
            error: false,
        };
    } catch (ex) {
        console.error("Confirmation Loader Error:", ex);
        return {
            order: null,
            paymentMetadata: null,
            error: true,
        };
    }
}

export default function CheckoutConfirmation() {
    const { order, error, paymentMetadata } = useLoaderData<typeof loader>();
    const revalidator = useRevalidator();
    const navigate = useNavigate();
    const [retries, setRetries] = useState(0);
    const maxRetries = 5;

    const midtransPayment = [...(order?.payments || [])].reverse().find(p => {
        if (p.method.includes('midtrans')) return true;
        // Also check metadata just in case method name isn't standard
        const meta = p.metadata as any;
        return meta?.paymentType || meta?.payment_type || meta?.transactionId;
    });

    const isSettled = midtransPayment?.state === 'Settled' || midtransPayment?.state === 'PartiallySettled';
    const isAuthorized = midtransPayment?.state === 'Authorized';
    const isDeclined = midtransPayment?.state === 'Declined' || midtransPayment?.state === 'Cancelled';

    // Auto-redirect to success page if settled
    useEffect(() => {
        if (order && isSettled) {
            navigate(`/checkout/success/${order.code}`, { replace: true });
        }
    }, [order, isSettled, navigate]);

    useEffect(() => {
        const hasMidtrans = order?.payments?.some(p => p.method.includes('midtrans'));
        if (hasMidtrans && !paymentMetadata && retries < maxRetries) {
            const timer = setTimeout(() => {
                setRetries(prev => prev + 1);
                revalidator.revalidate();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [order, paymentMetadata, retries, revalidator]);

    // Auto-poll for status updates if payment is pending
    useEffect(() => {
        const isPending = midtransPayment?.state === 'Authorized' || midtransPayment?.state === 'Created';

        if (isPending && !isSettled && !isDeclined) {
            const intervalId = setInterval(() => {
                if (revalidator.state === 'idle') {
                    revalidator.revalidate();
                }
            }, 15000); // Poll every 15 seconds instead of 5
            return () => clearInterval(intervalId);
        }
    }, [midtransPayment, isSettled, isDeclined, revalidator]);

    if (error || !order) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-16 text-center">
                <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-serif font-bold text-karima-brand mb-2">Something went wrong</h1>
                <p className="text-karima-ink/70">Order not found or still processing. Please check your order history.</p>
                <a href="/account/history" className="mt-8 inline-block text-karima-accent font-bold underline hover:text-karima-brand">Check Order History</a>
            </div>
        );
    }

    const activeCustomer = (useRouteLoaderData('root') as any)?.activeCustomer;

    return (
        <div className="bg-white min-h-screen py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white/80 shadow-xl rounded-3xl overflow-hidden border border-karima-brand/10 backdrop-blur-sm">
                    {/* ... (existing header content) ... */}
                    <div className="p-8 sm:p-12 text-center border-b border-karima-brand/10">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50/50 rounded-full mb-6">
                            <InformationCircleIcon className="w-10 h-10 text-blue-500" />
                        </div>
                        <h1 className="text-3xl font-black font-serif text-karima-brand uppercase tracking-tight mb-2">
                            {isDeclined ? 'Payment Failed' : 'Waiting for Payment'}
                        </h1>
                        <p className="text-karima-ink/60 font-medium italic mb-2">
                            {isDeclined ? 'Sorry, your payment could not be processed.' : 'Please complete your payment as instructed.'}
                        </p>
                        <p className="text-sm font-bold text-karima-gold uppercase tracking-widest">Order Number: <span className="text-karima-ink">{order.code}</span></p>
                    </div>

                    <div className="p-8 sm:p-12 space-y-10">
                        {isDeclined ? (
                            <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-start gap-4">
                                <XCircleIcon className="w-6 h-6 text-red-500 mt-0.5" />
                                <div>
                                    <p className="font-bold text-red-900 mb-1">Payment Declined or Cancelled</p>
                                    <p className="text-sm text-red-700 mb-4">Your transaction failed. You can try to checkout again with another payment method.</p>
                                    <a href="/checkout" className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-red-700 transition-all">
                                        <ArrowPathIcon className="w-4 h-4" />
                                        Try Again
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <>
                                {paymentMetadata && (
                                    <section className="bg-gray-50/50 rounded-2xl p-6 border border-karima-brand/5 mt-8">
                                        <div className="mb-6 text-center">
                                            <h2 className="text-lg font-bold text-karima-brand">Payment Instructions</h2>
                                            <p className="text-sm text-karima-ink/70 mt-1">Please complete existing payment according to instructions below</p>
                                        </div>
                                        <div className="max-w-xl mx-auto">
                                            <PaymentInstructions paymentData={paymentMetadata} currencyCode={order.currencyCode} />
                                        </div>
                                    </section>
                                )}

                                {!paymentMetadata && midtransPayment && (
                                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start gap-4">
                                        <InformationCircleIcon className="w-6 h-6 text-blue-500 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-blue-900 mb-1">Processing Payment...</p>
                                            <p className="text-sm text-blue-700">We are retrieving your payment instructions. Using bank transfer? Your VA number will appear here shortly.</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        <section className="pt-6 border-t border-karima-brand/10">
                            <h2 className="text-sm font-black text-karima-gold uppercase tracking-widest mb-6 border-l-4 border-karima-brand pl-4">Shipping Details</h2>
                            <div className="grid grid-cols-2 gap-8 text-sm">
                                <div>
                                    <p className="font-black text-karima-brand uppercase tracking-tighter mb-2">Shipping Address</p>
                                    <div className="text-karima-ink/80 space-y-1">
                                        <p className="font-bold text-karima-ink">{order.shippingAddress?.fullName}</p>
                                        <p>{order.shippingAddress?.streetLine1}</p>
                                        <p>{order.shippingAddress?.city}, {order.shippingAddress?.province}</p>
                                        <p>{order.shippingAddress?.postalCode}</p>
                                        <p>{order.shippingAddress?.phoneNumber}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="font-black text-gray-900 uppercase tracking-tighter mb-2">Shipping Method</p>
                                    <p className="text-gray-600">{order.shippingLines?.[0]?.shippingMethod?.name || 'Standard Shipping'}</p>
                                </div>
                            </div>
                        </section>

                        {/* Guest Account Info Banner */}
                        {!activeCustomer && (
                            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex flex-col md:flex-row items-start gap-4 shadow-sm">
                                <InformationCircleIcon className="w-8 h-8 text-amber-500 shrink-0" />
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-amber-900 mb-1 font-serif">Track Your Order History</h3>
                                    <p className="text-amber-800 text-sm mb-3 leading-relaxed">
                                        Your email <span className="font-bold text-amber-950">{order.customer?.emailAddress}</span> is registered with this order.
                                        Create a password to easily track this order and speed up future checkouts.
                                    </p>
                                    <a
                                        href="/forgot-password"
                                        className="inline-flex items-center text-sm font-bold text-amber-700 hover:text-amber-900 underline decoration-2 underline-offset-2 transition-colors"
                                    >
                                        Set Password & View History &rarr;
                                    </a>
                                </div>
                            </div>
                        )}

                        <div className="pt-10 flex flex-col sm:flex-row gap-4 border-t border-karima-brand/10">
                            <a href="/" className="flex-1 bg-karima-brand text-white text-center py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-karima-brand/90 transition-all shadow-xl">Back to Shopping</a>
                            <a href="/account/history" className="flex-1 bg-white text-karima-brand border-2 border-karima-brand text-center py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-karima-base transition-all">Order History</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
