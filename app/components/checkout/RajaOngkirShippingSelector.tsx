import { useState } from 'react';
import { Radio, RadioGroup } from '@headlessui/react';
import { clsx } from 'clsx';
import { CheckCircleIcon, TruckIcon, ClockIcon } from '@heroicons/react/24/solid';

import { Price } from '~/components/products/Price';
import { CurrencyCode } from '~/generated/graphql';

interface ShippingOption {
    id: string;
    courierCode: string;
    courierName: string;
    service: string;
    description?: string | null;
    cost: number;
    etd: string;
}

interface RajaOngkirShippingSelectorProps {
    shippingOptions: ShippingOption[];
    selectedOptionId: string | null;
    onChange: (option: ShippingOption) => void;
    isLoading?: boolean;
}

// Courier logo/icon mapping
const courierIcons: Record<string, string> = {
    jne: '🟠', // Orange for JNE
    jnt: '🔴', // Red for J&T
    sicepat: '🟡', // Yellow for SiCepat
    pos: '🔵', // Blue for POS Indonesia
    tiki: '🟢', // Green for TIKI
    lion: '🦁',
    ninja: '🥷',
    anteraja: '🚀',
    idexpress: '📦',
    wahana: '🚛',
};

const courierNames: Record<string, string> = {
    jne: 'JNE Express',
    jnt: 'J&T Express',
    sicepat: 'SiCepat',
    pos: 'POS Indonesia',
    tiki: 'TIKI',
    lion: 'Lion Parcel',
    ninja: 'Ninja Express',
    anteraja: 'AnterAja',
    idexpress: 'ID Express',
    sap: 'SAP Express',
    wahana: 'Wahana',
};


// Couriers that have local logo files
const SUPPORTED_LOGOS = ['jne', 'jnt', 'sicepat', 'pos', 'tiki', 'lion', 'ninja', 'anteraja', 'idexpress', 'wahana'];

// Courier logo component with fallback
function CourierLogo({ code }: { code: string }) {
    const [error, setError] = useState(false);
    const fallback = courierIcons[code] || <TruckIcon className="h-6 w-6 text-gray-400" />;

    // If code is 'custom' or not in supported list, show fallback immediately to avoid 404
    if (error || !SUPPORTED_LOGOS.includes(code.toLowerCase())) {
        return <div className="text-2xl">{fallback}</div>;
    }

    return (
        <img
            src={`/images/couriers/${code}.webp`}
            alt={`${code} logo`}
            className="h-full w-full object-contain p-1"
            onError={() => setError(true)}
        />
    );
}

export function RajaOngkirShippingSelector({
    shippingOptions,
    selectedOptionId,
    onChange,
    isLoading = false,
}: RajaOngkirShippingSelectorProps) {

    if (isLoading) {
        return (
            <div className="bg-white p-6 rounded-xl border border-karima-brand/10 shadow-sm">
                <h3 className="text-lg font-bold text-karima-brand font-serif mb-6">
                    Shipping Options (RajaOngkir)
                </h3>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse flex items-center gap-4 p-4 border border-gray-100 rounded-xl">
                            <div className="h-12 w-12 bg-gray-100 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                            </div>
                            <div className="h-6 w-20 bg-gray-100 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!shippingOptions || shippingOptions.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl border border-karima-brand/10 shadow-sm">
                <h3 className="text-lg font-bold text-karima-brand font-serif mb-4">
                    Shipping Options
                </h3>
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                    <TruckIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800 font-sans">
                        Please select a shipping destination first to see courier options.
                    </p>
                </div>
            </div>
        );
    }

    const selectedOption = shippingOptions.find((opt) => opt.id === selectedOptionId) || null;

    return (
        <div className="bg-white p-6 rounded-xl border border-karima-brand/10 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-karima-brand font-serif leading-none mb-1">
                        Shipping Options
                    </h3>
                    <p className="text-xs text-karima-ink/60 font-medium tracking-wide font-sans">
                        {shippingOptions.length} courier(s) available for your location
                    </p>
                </div>
            </div>

            <RadioGroup value={selectedOption ?? undefined} onChange={onChange} className="space-y-3">
                {shippingOptions.map((option) => (
                    <Radio
                        key={option.id}
                        value={option}
                        className={({ checked }) =>
                            clsx(
                                checked ? 'border-karima-brand bg-karima-brand/5' : 'border-gray-200 bg-white',
                                'relative border-2 rounded-xl p-4 flex cursor-pointer focus:outline-none hover:border-karima-brand/40 transition-all group'
                            )
                        }
                    >
                        {({ checked }) => (
                            <>
                                <div className="flex flex-col sm:flex-row sm:items-center flex-1 gap-4">
                                    {/* Courier Icon + Info Wrapper */}
                                    <div className="flex items-center flex-1 mb-2 sm:mb-0 gap-4">
                                        {/* Courier Icon */}
                                        <div className={clsx(
                                            "flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl transition-all overflow-hidden",
                                            checked ? "bg-white shadow-sm scale-110" : "bg-gray-100 group-hover:bg-gray-200"
                                        )}>
                                            <CourierLogo code={option.courierCode} />
                                        </div>

                                        {/* Courier Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className="block text-sm font-bold text-karima-ink font-sans">
                                                    {courierNames[option.courierCode] || option.courierName}
                                                </span>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter bg-karima-ink text-white font-sans">
                                                    {option.service}
                                                </span>
                                            </div>

                                            {option.description && (
                                                <span className="mt-1 block text-xs text-karima-ink/60 truncate italic font-sans">
                                                    {option.description}
                                                </span>
                                            )}

                                            {/* ETD */}
                                            <div className="mt-2 flex items-center text-[10px] font-bold text-karima-ink/60 uppercase tracking-widest font-sans">
                                                <ClockIcon className="h-3 w-3 mr-1 text-karima-brand" />
                                                <span>{option.etd} DAYS</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="flex-shrink-0 sm:ml-4 text-left sm:text-right border-t sm:border-none pt-2 sm:pt-0 mt-2 sm:mt-0 flex justify-between sm:block border-gray-100">
                                        <span className="text-base font-black text-karima-brand block">
                                            <Price priceWithTax={option.cost} currencyCode={CurrencyCode.Idr} />
                                        </span>
                                        {checked && (
                                            <span className="text-[10px] text-karima-brand font-bold uppercase tracking-tight font-sans">SELECTED</span>
                                        )}
                                    </div>
                                </div>

                                {checked && (
                                    <CheckCircleIcon
                                        className="h-6 w-6 text-karima-brand absolute -top-2 -right-2 bg-white rounded-full"
                                        aria-hidden="true"
                                    />
                                )}
                            </>
                        )}
                    </Radio>
                ))}
            </RadioGroup>
        </div>
    );
}
