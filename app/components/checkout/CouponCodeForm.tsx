import { useState } from 'react';
import { TagIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { FetcherWithComponents } from 'react-router';

interface CouponCodeFormProps {
    activeOrder: any;
    activeOrderFetcher: FetcherWithComponents<any>;
    applyCoupon: (code: string) => void;
    removeCoupon: (code: string) => void;
    error?: any;
}

export function CouponCodeForm({ activeOrder, activeOrderFetcher, applyCoupon, removeCoupon, error }: CouponCodeFormProps) {
    const [couponCode, setCouponCode] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    const isSubmitting = activeOrderFetcher.state !== 'idle';

    // Extract error from fetcher data OR props
    const fetcherError = activeOrderFetcher.data?.error || error;
    const couponError =
        fetcherError?.errorCode?.startsWith('COUPON_CODE') ||
            fetcherError?.errorCode === 'COUPON_NOT_APPLICABLE'
            ? fetcherError
            : null;

    const handleApplyCoupon = (e: React.FormEvent) => {
        e.preventDefault();
        if (!couponCode) return;
        applyCoupon(couponCode);
        setCouponCode('');
    };

    const handleRemoveCoupon = (code: string) => {
        removeCoupon(code);
    };

    // Extract applied codes from activeOrder
    const couponCodes = activeOrder?.couponCodes || [];

    // Map error codes to user-friendly messages
    const getErrorMessage = (error: any): string => {
        switch (error?.errorCode) {
            case 'COUPON_CODE_EXPIRED_ERROR':
                return 'Coupon code has expired.';
            case 'COUPON_CODE_INVALID_ERROR':
                return 'Invalid coupon code.';
            case 'COUPON_CODE_LIMIT_ERROR':
                return 'Coupon code usage limit reached.';
            case 'COUPON_NOT_APPLICABLE':
                return error?.message || 'Coupon code does not apply to this cart.';
            default:
                return error?.message || 'Failed to apply coupon code.';
        }
    };

    return (
        <div className="space-y-4">
            {/* Active Coupons */}
            {couponCodes.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {couponCodes.map((code: string) => (
                        <div key={code} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-karima-brand/5 border border-karima-brand/20 text-xs font-medium text-karima-brand">
                            <TagIcon className="w-3 h-3" />
                            <span>{code}</span>
                            <button
                                onClick={() => handleRemoveCoupon(code)}
                                disabled={isSubmitting}
                                className="ml-1 hover:text-red-500 transition-colors"
                            >
                                <XMarkIcon className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Error Message */}
            {couponError && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-sm text-sm text-red-600">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{getErrorMessage(couponError)}</span>
                </div>
            )}

            {/* Input Form - Always visible to allow adding more coupons or retrying */}
            <form onSubmit={handleApplyCoupon} className="flex gap-3">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Discount code"
                        className="w-full px-4 py-3 bg-[#F5F5F5] border-none rounded-sm focus:ring-1 focus:ring-karima-brand focus:bg-white transition-colors text-base text-karima-ink placeholder:text-gray-400"
                        disabled={isSubmitting}
                    />
                </div>
                <button
                    type="submit"
                    disabled={!couponCode.trim() || isSubmitting}
                    className="bg-black hover:bg-karima-brand text-white px-8 py-3 rounded-none transition-all duration-300 text-xs font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed font-sans"
                >
                    {isSubmitting ? '...' : 'Apply'}
                </button>
            </form>
        </div>
    );
}
