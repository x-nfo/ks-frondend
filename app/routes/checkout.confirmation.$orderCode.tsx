import { getOrderByCode } from '~/providers/orders/order';
import { useLoaderData, useRevalidator, useNavigate, useRouteLoaderData } from 'react-router';
import type { Route } from './+types/checkout.confirmation.$orderCode';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { PaymentInstructions } from '~/components/checkout/midtrans/PaymentInstructions';
import type { MidtransPaymentData } from '~/components/checkout/midtrans/types';


export async function loader({ params, request, context }: Route.LoaderArgs) {
    // Do NOT pass kv here — orderByCode must always be fetched fresh (never cached)
    // so that payment state changes (Authorized → Settled) are immediately visible.
    const options = { request };
    const orderCode = (params as any).orderCode;
    if (!orderCode) throw new Error("Order code missing");

    // Ensure API URL is set from Cloudflare env before any requests
    // (route loaders run in parallel with root loader, so setApiUrl may not have been called yet)
    const { setApiUrl, DEMO_API_URL } = await import('~/constants');
    const envApiUrl = (context.cloudflare?.env as any)?.VENDURE_API_URL || process.env.VENDURE_API_URL || DEMO_API_URL;
    setApiUrl(envApiUrl);

    // Diagnose: log incoming cookie header (masked) and whether auth token is present
    const cookieHeader = request.headers.get('Cookie') || '';
    const hasAuthToken = cookieHeader.includes('authToken') || cookieHeader.includes('vendure_session');
    console.log(`[confirmation loader] orderCode: ${orderCode}`);
    console.log(`[confirmation loader] Cookie header present: ${cookieHeader.length > 0}, hasAuthToken: ${hasAuthToken}`);

    try {
        const order = await getOrderByCode(orderCode, options);
        console.log(`[confirmation loader] getOrderByCode result: ${order ? `FOUND (state: ${order.state})` : 'NULL'}`);

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

        // 2. Fetch payment state + metadata via midtransPaymentData custom query.
        // This is the authoritative source: it reads directly from the DB, bypassing
        // Shop API restrictions, and now also returns the Vendure payment state.
        // This allows us to detect settlement even when orderByCode returns null
        // (which can happen after Vendure clears the activeOrder session on settlement).
        let paymentStateFromQuery: string | null = null;
        try {
            const apiUrl = envApiUrl;
            const query = `query($code: String!) { midtransPaymentData(orderCode: $code) { state metadata } }`;
            const forwardHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
            const cookieHeader = request.headers.get('Cookie');
            if (cookieHeader) forwardHeaders['Cookie'] = cookieHeader;

            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: forwardHeaders,
                body: JSON.stringify({ query, variables: { code: orderCode } })
            });

            if (res.ok) {
                const json = (await res.json()) as any;
                console.log(`[confirmation] midtransPaymentData raw response:`, JSON.stringify(json));
                const paymentStatus = json.data?.midtransPaymentData;
                if (paymentStatus) {
                    paymentStateFromQuery = paymentStatus.state ?? null;
                    console.log(`[confirmation] paymentStateFromQuery:`, paymentStateFromQuery);
                    if (!paymentMetadata && paymentStatus.metadata) {
                        try {
                            const freshMetadata = JSON.parse(paymentStatus.metadata);
                            if (freshMetadata && Object.keys(freshMetadata).length > 0) {
                                paymentMetadata = freshMetadata;
                            }
                        } catch (e) {
                            console.error('Failed to parse fresh metadata JSON', e);
                        }
                    }
                } else {
                    console.log(`[confirmation] midtransPaymentData returned null/undefined. errors:`, JSON.stringify(json.errors));
                }
            } else {
                console.error(`[confirmation] midtransPaymentData HTTP error:`, res.status, res.statusText);
            }
        } catch (e) {
            console.error('Failed to fetch Midtrans payment data via custom query:', e);
        }

        console.log(`[confirmation] Successfully fetched order:`, order?.code, order?.state);
        return {
            order,
            orderCode,
            paymentMetadata,
            paymentStateFromQuery,
            error: false,
        };
    } catch (ex: any) {
        console.error("Confirmation Loader Error:", ex);
        return {
            order: null,
            orderCode,
            paymentMetadata: null,
            paymentStateFromQuery: null,
            error: true,
            errorMessage: ex?.message || 'Unknown error'
        };
    }
}

export function ErrorBoundary({ error }: any) {
    console.error("💥 CHECKOUT CONFIRMATION ERROR:", error);
    return (
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
            <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-sans font-bold text-karima-brand mb-2">Something went wrong</h1>
            <p className="text-karima-ink/70">We encountered an error while displaying your order confirmation. Your order may have been processed successfully.</p>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left overflow-auto max-h-40 inline-block max-w-full">
                <p className="text-[10px] font-mono text-red-800 break-words">{(error as any)?.message || 'Unknown Error'}</p>
            </div>
            <div className="mt-8 space-x-4">
                <a href="/account/history" className="text-karima-accent font-bold underline hover:text-karima-brand">Check Order History</a>
                <a href="/" className="text-karima-accent font-bold underline hover:text-karima-brand">Back to Shopping</a>
            </div>
        </div>
    );
}

export default function CheckoutConfirmation() {
    const { order, orderCode, error, paymentMetadata, paymentStateFromQuery } = useLoaderData<typeof loader>();
    const revalidator = useRevalidator();
    const navigate = useNavigate();
    const [retries, setRetries] = useState(0);
    const [orderRetries, setOrderRetries] = useState(0);
    const maxRetries = 5;
    const maxOrderRetries = 6;
    const activeCustomer = (useRouteLoaderData('root') as any)?.activeCustomer;

    const midtransPayment = [...(order?.payments || [])].reverse().find(p => {
        if (p.method.includes('midtrans')) return true;
        // Also check metadata just in case method name isn't standard
        const meta = p.metadata as any;
        return meta?.paymentType || meta?.payment_type || meta?.transactionId;
    });

    // isSettled: check from orderByCode payment list OR from the custom query
    // The custom query reads directly from DB, so it's authoritative even when
    // orderByCode returns null (e.g. after Vendure clears the session on settlement).
    const isSettledFromOrder = midtransPayment?.state === 'Settled' || midtransPayment?.state === 'PartiallySettled';
    const isSettledFromQuery = paymentStateFromQuery === 'Settled' || paymentStateFromQuery === 'PartiallySettled';
    const isSettled = isSettledFromOrder || isSettledFromQuery;
    const isDeclined = midtransPayment?.state === 'Declined' || midtransPayment?.state === 'Cancelled'
        || paymentStateFromQuery === 'Declined' || paymentStateFromQuery === 'Cancelled';

    // orderCode comes from loader params — available even when order object is null

    // Auto-redirect to success page if settled — works even if order is null
    useEffect(() => {
        if (isSettled && orderCode) {
            navigate(`/checkout/success/${orderCode}`, { replace: true });
        }
    }, [isSettled, orderCode, navigate]);

    // If order is null (race condition right after payment), retry fetching before showing error
    useEffect(() => {
        if (!order && !error && orderRetries < maxOrderRetries) {
            const timer = setTimeout(() => {
                setOrderRetries(prev => prev + 1);
                revalidator.revalidate();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [order, error, orderRetries, revalidator]);

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
        const isPendingFromOrder = midtransPayment?.state === 'Authorized';
        const isPendingFromQuery = paymentStateFromQuery === 'Authorized';
        const isPending = isPendingFromOrder || isPendingFromQuery;

        if (isPending && !isSettled && !isDeclined) {
            const intervalId = setInterval(() => {
                if (revalidator.state === 'idle') {
                    revalidator.revalidate();
                }
            }, 15000);
            return () => clearInterval(intervalId);
        }
    }, [midtransPayment, paymentStateFromQuery, isSettled, isDeclined, revalidator]);

    // If order is null but payment is settled, a redirect is already in-flight via the useEffect above.
    // Show a brief loading state instead of an error to avoid a flash of the error screen.
    if (!order && isSettled) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-16 text-center">
                <ArrowPathIcon className="w-10 h-10 text-karima-brand mx-auto mb-4 animate-spin" />
                <p className="text-karima-ink/70">Redirecting to confirmation...</p>
            </div>
        );
    }

    // Order null tapi masih retry → tampilkan loading, bukan error
    if (!order && !error && orderRetries < maxOrderRetries) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-16 text-center">
                <ArrowPathIcon className="w-10 h-10 text-karima-brand mx-auto mb-4 animate-spin" />
                <p className="text-karima-ink/70 font-medium">Memuat detail pesanan...</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-16 text-center">
                <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-sans font-bold text-karima-brand mb-2">Something went wrong</h1>
                <p className="text-karima-ink/70">Order not found or still processing. Please check your order history.</p>
                <a href="/account/history" className="mt-8 inline-block text-karima-accent font-bold underline hover:text-karima-brand">Check Order History</a>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white/80 shadow-xl rounded-3xl overflow-hidden border border-karima-brand/10 backdrop-blur-sm">
                    {/* ... (existing header content) ... */}
                    <div className="p-6 sm:p-12 text-center border-b border-karima-brand/10">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50/50 rounded-full mb-6">
                            <InformationCircleIcon className="w-10 h-10 text-blue-500" />
                        </div>
                        <h1 className="text-3xl font-black font-sans text-karima-brand uppercase tracking-tight mb-2">
                            {isDeclined ? 'Payment Failed' : 'Waiting for Payment'}
                        </h1>
                        <p className="text-karima-ink/60 font-medium italic mb-2">
                            {isDeclined ? 'Sorry, your payment could not be processed.' : 'Please complete your payment as instructed.'}
                        </p>
                        <p className="text-sm font-bold text-karima-gold uppercase tracking-widest">Order Number: <span className="text-karima-ink">{order.code}</span></p>
                    </div>

                    <div className="p-6 sm:p-12 space-y-10">
                        {isDeclined ? (
                            <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-start gap-4">
                                <XCircleIcon className="w-6 h-6 text-red-500 mt-0.5" />
                                <div>
                                    <p className="font-bold text-red-900 mb-1">Payment Declined or Cancelled</p>
                                    <p className="text-sm text-red-700 mb-4">Your transaction failed. You can try to checkout again with another payment method.</p>
                                    <a href="/checkout" className="inline-flex items-center gap-2 bg-black hover:bg-karima-brand text-white px-8 py-4 rounded-none text-sm font-black uppercase tracking-widest transition-all">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm">
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
                                    <h3 className="text-lg font-bold text-amber-900 mb-1 font-sans">Track Your Order History</h3>
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
                            <a href="/" className="flex-1 bg-black hover:bg-karima-brand text-white text-center py-4 rounded-none font-black uppercase tracking-widest text-xs transition-all">Back to Shopping</a>
                            <a href="/account/history" className="flex-1 bg-white text-karima-brand border-2 border-karima-brand text-center py-4 rounded-none font-black uppercase tracking-widest text-xs hover:bg-karima-brand hover:text-white transition-all">Order History</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
