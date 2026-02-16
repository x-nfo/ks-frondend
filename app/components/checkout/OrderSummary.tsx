import { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { CouponCodeForm } from './CouponCodeForm';

import { Price } from '~/components/products/Price';
import type { CurrencyCode } from '~/generated/graphql';

interface OrderLine {
    id: string;
    featuredAsset?: {
        preview: string;
    } | null;
    productVariant: {
        name: string;
        price: number;
    };
    quantity: number;
    linePriceWithTax: number;
    proratedUnitPriceWithTax: number;
    unitPriceWithTax: number;
    discounts: {
        description: string;
        amountWithTax: number;
    }[];
}

import { Link, type FetcherWithComponents } from 'react-router';

interface OrderSummaryProps {
    lines: OrderLine[];
    subTotal: number;
    shippingCost: number;
    total: number;
    currencyCode: CurrencyCode;
    activeOrder: any;
    activeOrderFetcher: FetcherWithComponents<any>;
    applyCoupon: (code: string) => void;
    removeCoupon: (code: string) => void;
    error?: any;
}

export function OrderSummary({
    lines,
    subTotal,
    shippingCost,
    total,
    currencyCode,
    activeOrder,
    activeOrderFetcher,
    applyCoupon,
    removeCoupon,
    error,
}: OrderSummaryProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    const totalDiscountAmount = (activeOrder?.discounts || [])
        .reduce((sum: number, d: any) => sum + Math.abs(d.amountWithTax), 0);

    // Use the total from the API (backend) as the source of truth
    const displayTotal = total;

    return (
        <div className="p-4 lg:p-6 lg:sticky lg:top-4 h-auto lg:h-full border border-karima-brand/10 lg:border-none rounded-sm lg:rounded-none">
            {/* Mobile toggle */}
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="lg:hidden w-full flex items-center justify-between mb-4"
            >
                <h3 className="text-lg font-medium text-karima-brand font-serif">
                    Order Summary
                </h3>
                {isExpanded ? (
                    <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                ) : (
                    <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                )}
            </button>

            {/* Desktop title */}
            <div className='flex justify-between items-center mb-6'>
                <h3 className="hidden lg:block text-xl font-medium text-karima-brand">
                    Order - {lines.reduce((acc, line) => acc + line.quantity, 0)} items
                </h3>
                <div className='text-karima-ink/60 underline underline-offset-4 text-sm'> <Link to={'/cart'}>Edit cart</Link> </div>
            </div>

            {/* Content */}
            <div className={`${isExpanded ? 'block' : 'hidden lg:block'}`}>
                {/* Order items */}
                <div className="space-y-6 mb-8 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-karima-brand/20">
                    {lines.map((line) => (
                        <div key={line.id} className="flex gap-4">
                            {/* Product Image */}
                            <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-sm overflow-hidden">
                                {line.featuredAsset?.preview ? (
                                    <img
                                        src={line.featuredAsset.preview + '?preset=medium'}
                                        alt={line.productVariant.name}
                                        className="w-full h-full object-cover object-center"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                <div className="flex justify-between items-start gap-4">
                                    <h4 className="text-base font-medium text-karima-ink truncate pr-2">
                                        {line.productVariant.name}
                                    </h4>
                                    <p className="text-base font-medium text-karima-ink whitespace-nowrap">
                                        {(line.discounts || []).some((d: any) => d.amountWithTax !== 0) && line.proratedUnitPriceWithTax < line.unitPriceWithTax ? (
                                            <span className="flex flex-col items-end gap-1">
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
                                <div className="space-y-1">
                                    <p className="text-sm text-karima-ink/60">
                                        Variant: {line.productVariant.name}
                                    </p>
                                    <p className="text-sm text-karima-ink/60">
                                        Quantity: {line.quantity}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Coupon Code */}
            <div className="border-t border-karima-brand/10 py-6">
                <CouponCodeForm
                    activeOrder={activeOrder}
                    activeOrderFetcher={activeOrderFetcher}
                    applyCoupon={applyCoupon}
                    removeCoupon={removeCoupon}
                    error={error}
                />
            </div>

            {/* Costs Breakdown */}
            <div className="space-y-3 font-sans text-karima-ink">
                {/* Subtotal */}
                <div className="flex justify-between items-center text-base">
                    <span>Subtotal</span>
                    <span className="font-medium">
                        <Price priceWithTax={subTotal + totalDiscountAmount} currencyCode={currencyCode} />
                    </span>
                </div>

                {/* Promotions/Discounts */}
                {totalDiscountAmount > 0 && (
                    <div className="flex justify-between items-center text-base text-green-600">
                        <span>Discount</span>
                        <span className="font-medium">
                            - <Price priceWithTax={totalDiscountAmount} currencyCode={currencyCode} />
                        </span>
                    </div>
                )}

                {/* Shipping */}
                <div className="flex justify-between items-center text-base">
                    <span>Shipping</span>
                    <span className="font-medium">
                        {shippingCost > 0 ? (
                            <Price priceWithTax={shippingCost} currencyCode={currencyCode} />
                        ) : (
                            <span className="text-karima-ink/60 text-sm">Calculated at next step</span>
                        )}
                    </span>
                </div>

                {/* Taxes - Placeholder as per design request to remove specific 'Inc VAT' label but keep totals clear */}
                {/* Design doesn't show tax line explicitly, but standard e-com usually does if needed.
                     User asked to "Hapus inc Vat", implying removing the label from Total.
                     We will add a Taxes row to be explicit if non-zero, or just keep it simple as per screenshot.
                     Screenshot shows Subtotal, Shipping, Taxes.
                 */}
                {/* <div className="flex justify-between items-center text-base">
                    <span>Taxes</span>
                    <span className="font-medium">
                        <Price priceWithTax={activeOrder?.taxTotal || 0} currencyCode={currencyCode} />
                    </span>
                </div> */}


                {/* Total */}
                <div className="pt-6 flex justify-between items-center mt-4">
                    <span className="text-xl font-normal text-karima-ink">Total</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-normal text-karima-ink">
                            {/* <span className="mr-1">{currencyCode}</span> */}
                            <Price priceWithTax={displayTotal} currencyCode={currencyCode} />
                        </span>
                    </div>
                </div>
            </div>


        </div>
    );
}
