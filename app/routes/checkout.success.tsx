import { getOrderByCode } from '~/providers/orders/order';
import { useLoaderData, useRouteLoaderData } from 'react-router';
import type { Route } from './+types/checkout.success';
import { CheckCircleIcon, ShoppingBagIcon, InformationCircleIcon } from '@heroicons/react/24/outline';


export async function loader({ params, request, context }: Route.LoaderArgs) {
    const kv = context.cloudflare?.env?.KV_CACHE;
    const apiUrl = (context.cloudflare?.env as any)?.VENDURE_API_URL || process.env.VENDURE_API_URL || 'http://localhost:3000/shop-api';
    const options = { request, kv, apiUrl };
    const orderCode = (params as any).orderCode;
    if (!orderCode) throw new Error("Order code missing");

    try {
        const order = await getOrderByCode(orderCode, options);

        const midtransPayment = order?.payments?.find(p => p.method.includes('midtrans'));
        const isSettled = midtransPayment?.state === 'Settled' || midtransPayment?.state === 'PartiallySettled';

        if (!order || !isSettled) {
            // If not settled, redirect back to confirmation (pending) page
            if (midtransPayment) {
                throw new Response("", { status: 302, headers: { Location: `/checkout/confirmation/${orderCode}` } });
            }
        }

        return {
            order,
            error: false,
        };
    } catch (ex) {
        if (ex instanceof Response) throw ex;
        console.error("Success Page Loader Error:", ex);
        return {
            order: null,
            error: true,
        };
    }
}

export default function CheckoutSuccess() {
    const { order, error } = useLoaderData<typeof loader>();
    const activeCustomer = (useRouteLoaderData('root') as any)?.activeCustomer;

    if (error || !order) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-16 text-center">
                <h1 className="text-2xl font-bold font-serif text-karima-brand mb-2">Something went wrong</h1>
                <p className="text-karima-ink/70">Order not found or still processing.</p>
                <a href="/" className="mt-8 inline-block text-karima-accent font-bold underline hover:text-karima-brand">Back to Shopping</a>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white/80 shadow-xl rounded-3xl overflow-hidden border border-karima-brand/10 backdrop-blur-sm">
                    <div className="p-8 sm:p-12 text-center border-b border-karima-brand/10 bg-green-50/30">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100/50 rounded-full mb-6">
                            <CheckCircleIcon className="w-12 h-12 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-black font-serif text-karima-brand uppercase tracking-tight mb-2">
                            Thank You!
                        </h1>
                        <p className="text-karima-ink/70 font-medium mb-2">
                            We have received your order and it is being processed.
                        </p>
                        <p className="text-sm font-bold text-karima-gold uppercase tracking-widest">
                            Order Number: <span className="text-karima-ink">{order.code}</span>
                        </p>
                    </div>

                    <div className="p-8 sm:p-12 space-y-10">
                        <div className="bg-green-50 border border-green-100 rounded-2xl p-6 flex items-start gap-4">
                            <ShoppingBagIcon className="w-6 h-6 text-green-600 mt-0.5" />
                            <div>
                                <p className="font-bold text-green-900 mb-1">Payment Settled</p>
                                <p className="text-sm text-green-700">Your payment has been successfully confirmed.</p>
                            </div>
                        </div>

                        <section className="pt-6">
                            <h2 className="text-sm font-black text-karima-gold uppercase tracking-widest mb-6 border-l-4 border-karima-brand pl-4">
                                Shipping Details
                            </h2>
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
                            <a href="/" className="flex-1 bg-karima-brand text-white text-center py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-karima-brand/90 transition-all shadow-xl">
                                Back to Shopping
                            </a>
                            <a href="/account/history" className="flex-1 bg-white text-karima-brand border-2 border-karima-brand text-center py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-karima-base transition-all">
                                Order History
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
