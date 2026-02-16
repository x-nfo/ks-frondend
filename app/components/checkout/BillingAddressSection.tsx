import { useState } from 'react';

import { AddressForm } from '../account/AddressForm';
import { clsx } from 'clsx';
import { MapPinIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface Country {
    id: string;
    code: string;
    name: string;
}

interface Address {
    fullName?: string | null;
    company?: string | null;
    streetLine1: string;
    streetLine2?: string | null;
    city?: string | null;
    province?: string | null;
    postalCode?: string | null;
    country?: {
        id: string;
        code: string;
        name: string;
    } | null;
    phoneNumber?: string | null;
}

interface BillingAddressSectionProps {
    availableCountries: Country[];
    shippingAddress?: Address;
    billingAddress?: Address;
    onBillingAddressChange: (useSameAsShipping: boolean, address?: Address) => void;
    defaultFullName?: string;
}

export function BillingAddressSection({
    availableCountries,
    shippingAddress,
    billingAddress,
    onBillingAddressChange,
    defaultFullName,
}: BillingAddressSectionProps) {
    const [useSameAsShipping, setUseSameAsShipping] = useState(true);

    const handleToggle = (checked: boolean) => {
        setUseSameAsShipping(checked);
        onBillingAddressChange(checked, checked ? shippingAddress : undefined);
    };

    return (
        <div className="bg-white p-6 rounded-none border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-none">
                    <ShieldCheckIcon className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-karima-brand font-serif leading-none">
                    Billing Address
                </h2>
            </div>

            {/* Same as shipping checkbox */}
            <div className={clsx(
                "flex items-start p-4 rounded-none border-2 transition-all cursor-pointer",
                useSameAsShipping ? "border-karima-brand bg-karima-brand/5" : "border-gray-100 bg-gray-50/50 hover:border-gray-200"
            )}
                onClick={() => handleToggle(!useSameAsShipping)}
            >
                <div className="flex items-center h-5">
                    <input
                        id="same-as-shipping"
                        name="same-as-shipping"
                        type="checkbox"
                        checked={useSameAsShipping}
                        onChange={(e) => handleToggle(e.target.checked)}
                        className="focus:ring-karima-brand h-4 w-4 text-karima-brand border-gray-300 rounded-sm cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
                <div className="ml-3 text-sm">
                    <label htmlFor="same-as-shipping" className="font-bold text-karima-ink cursor-pointer font-sans">
                        Same as shipping address
                    </label>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Use the shipping address you entered for this billing detail.
                    </p>
                </div>
            </div>

            {/* Billing address form (shown when not same as shipping) */}
            {!useSameAsShipping && (
                <div className="mt-6 p-6 bg-gray-50 border border-gray-100 rounded-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    <AddressForm
                        availableCountries={availableCountries as any}
                        address={billingAddress as any}
                        defaultFullName={defaultFullName}
                    />
                </div>
            )}

            {/* Display shipping address preview when using same as shipping */}
            {useSameAsShipping && shippingAddress && (
                <div className="mt-4 p-5 bg-white border border-gray-100 rounded-none flex items-start gap-4 shadow-inner">
                    <div className="p-2 bg-gray-50 text-gray-400 rounded-none">
                        <MapPinIcon className="w-5 h-5" />
                    </div>
                    <div className="text-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Address Preview</p>
                        <div className="text-gray-700 space-y-1 font-medium">
                            {shippingAddress.fullName && <p className="font-bold text-gray-900">{shippingAddress.fullName}</p>}
                            <p>{shippingAddress.streetLine1}</p>
                            {shippingAddress.streetLine2 && <p>{shippingAddress.streetLine2}</p>}
                            <p>
                                {[shippingAddress.city, shippingAddress.province, shippingAddress.postalCode]
                                    .filter(Boolean)
                                    .join(', ')}
                            </p>
                            {shippingAddress.country && <p>{shippingAddress.country.name}</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
