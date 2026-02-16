import { Link, useOutletContext } from "react-router";
import { Trash2 } from "lucide-react";
import { Price } from "~/components/products/Price";
import { CouponCodeForm } from "~/components/checkout/CouponCodeForm";
import type { OutletContext } from "~/types";
import { CurrencyCode } from "~/generated/graphql";

export default function CartPage() {
    const { activeOrder, activeOrderFetcher, adjustOrderLine, removeItem, applyCoupon, removeCoupon } = useOutletContext<OutletContext>();
    const currencyCode = activeOrder?.currencyCode || CurrencyCode.Idr;
    const lines = activeOrder?.lines || [];

    const subTotal = activeOrder?.subTotalWithTax || 0;
    const shipping = activeOrder?.shippingWithTax || 0;
    const total = activeOrder?.totalWithTax || 0;

    if (!activeOrder || lines.length === 0) {
        return (
            <div className="mt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <h1 className="text-3xl font-serif text-karima-brand mb-4">Your Shopping Cart</h1>
                <p className="text-gray-500 mb-8">Your cart is currently empty.</p>
                <Link to="/" className="inline-block bg-karima-brand text-white px-8 py-3 rounded-sm uppercase tracking-wider text-sm font-medium hover:bg-karima-brand/90 transition-colors">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="mt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-serif text-karima-brand mb-12">Your shopping cart</h1>

            <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
                {/* Left Column: Cart Items */}
                <div className="lg:col-span-8">
                    <ul className="divide-y divide-gray-200 border-t border-gray-200">
                        {lines.map((line: any) => (
                            <li key={line.id} className="flex py-6 sm:py-10">
                                <div className="flex-shrink-0">
                                    <img
                                        src={line.featuredAsset?.preview + "?preset=thumb"}
                                        alt={line.productVariant.name}
                                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-none object-center object-cover bg-gray-100"
                                    />
                                </div>

                                <div className="ml-4 flex-1 flex flex-col justify-between sm:ml-6">
                                    <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                                        <div>
                                            <div className="flex justify-between">
                                                <h3 className="text-lg">
                                                    <Link to={`/products/${line.productVariant.product.slug}`} className="font-medium text-gray-900 hover:text-karima-brand">
                                                        {line.productVariant.product.name}
                                                    </Link>
                                                </h3>
                                            </div>
                                            <div className="mt-1 flex text-sm">
                                                <p className="text-gray-500">{line.productVariant.name}</p>
                                            </div>
                                            <p className="mt-1 text-sm font-medium text-gray-900">
                                                {(line.discounts || []).some((d: any) => d.amountWithTax !== 0) && line.proratedUnitPriceWithTax < line.unitPriceWithTax ? (
                                                    <span className="flex flex-col items-start gap-1">
                                                        <span className="line-through text-gray-400 text-xs">
                                                            <Price priceWithTax={line.unitPriceWithTax * line.quantity} currencyCode={currencyCode} />
                                                        </span>
                                                        <span className="text-green-600">
                                                            <Price priceWithTax={line.proratedUnitPriceWithTax * line.quantity} currencyCode={currencyCode} />
                                                        </span>
                                                    </span>
                                                ) : (
                                                    <Price priceWithTax={line.unitPriceWithTax * line.quantity} currencyCode={currencyCode} />
                                                )}
                                            </p>
                                        </div>

                                        <div className="mt-4 sm:mt-0 sm:pr-9">
                                            <label htmlFor={`quantity-${line.id}`} className="sr-only">
                                                Quantity, {line.productVariant.name}
                                            </label>

                                            <div className="flex items-center border border-gray-300 w-fit">
                                                <button
                                                    type="button"
                                                    onClick={() => adjustOrderLine(line.id, Math.max(1, line.quantity - 1))}
                                                    disabled={line.quantity <= 1}
                                                    className="p-2 text-gray-600 hover:text-karima-brand disabled:opacity-30"
                                                >
                                                    <span className="sr-only">Decrease quantity</span>
                                                    <span className="text-lg">-</span>
                                                </button>
                                                <span className="w-8 text-center text-gray-900 font-medium">{line.quantity}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => adjustOrderLine(line.id, line.quantity + 1)}
                                                    className="p-2 text-gray-600 hover:text-karima-brand"
                                                >
                                                    <span className="sr-only">Increase quantity</span>
                                                    <span className="text-lg">+</span>
                                                </button>
                                            </div>

                                            <div className="absolute top-0 right-0">
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(line.id)}
                                                    className="-m-2 p-2 inline-flex text-gray-400 hover:text-gray-500 transition-colors"
                                                >
                                                    <span className="sr-only">Remove</span>
                                                    <Trash2 className="h-5 w-5" aria-hidden="true" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-4 mt-16 lg:mt-0">
                    <div className="bg-gray-50/50 p-6 sm:p-8 rounded-none">
                        <div className="flow-root">
                            <dl className="-my-4 text-sm divide-y divide-gray-200">
                                <div className="py-4 flex items-center justify-between">
                                    <dt className="text-gray-600">Subtotal</dt>
                                    <dd className="font-medium text-gray-900">
                                        <Price priceWithTax={subTotal + ((activeOrder?.discounts || [])
                                            .reduce((sum: number, d: any) => sum + Math.abs(d.amountWithTax), 0))} currencyCode={currencyCode} />
                                    </dd>
                                </div>
                                {(activeOrder?.discounts || []).filter((d: any) => d.amountWithTax < 0).map((discount: any, i: number) => (
                                    <div key={i} className="py-4 flex items-center justify-between">
                                        <dt className="text-green-600">{discount.description}</dt>
                                        <dd className="font-medium text-green-600">
                                            <Price priceWithTax={discount.amountWithTax} currencyCode={currencyCode} />
                                        </dd>
                                    </div>
                                ))}
                                <div className="py-4 flex items-center justify-between">
                                    <dt className="text-gray-600">Shipping</dt>
                                    <dd className="font-medium text-gray-900">
                                        {shipping > 0 ? (
                                            <Price priceWithTax={shipping} currencyCode={currencyCode} />
                                        ) : (
                                            <span className="text-gray-400">Calculated at checkout</span>
                                        )}
                                    </dd>
                                </div>
                                <div className="py-4 flex items-center justify-between">
                                    <dt className="text-gray-600">Taxes</dt>
                                    <dd className="font-medium text-gray-900">
                                        <Price priceWithTax={activeOrder?.taxTotal ?? 0} currencyCode={currencyCode} />
                                    </dd>
                                </div>
                                <div className="py-4 flex items-center justify-between border-t border-gray-200">
                                    <dt className="text-base font-bold text-gray-900">Total:</dt>
                                    <dd className="text-xl font-bold text-gray-900">
                                        <Price priceWithTax={total} currencyCode={currencyCode} />
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        <div className="mt-6">
                            <CouponCodeForm
                                activeOrder={activeOrder}
                                activeOrderFetcher={activeOrderFetcher}
                                applyCoupon={applyCoupon}
                                removeCoupon={removeCoupon}
                            />
                        </div>

                        <div className="mt-6">
                            <Link
                                to="/checkout"
                                className="w-full flex justify-center items-center px-6 py-4 border border-transparent text-base font-medium rounded-sm shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors uppercase tracking-widest"
                            >
                                Proceed to checkout
                            </Link>
                        </div>

                        <div className="mt-6">
                            <div className="bg-gray-100 p-4 flex items-start gap-3 rounded-none">
                                <div className="flex-shrink-0 mt-0.5">
                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <p className="text-sm text-gray-500">
                                    Already have an account? No worries, just <Link to="/sign-in" className="font-medium text-gray-900 hover:text-gray-700 underline">log in</Link>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
