import { Radio, RadioGroup } from '@headlessui/react';
import { clsx } from 'clsx';
import { Price } from '~/components/products/Price';
import { CheckCircleIcon, TruckIcon } from '@heroicons/react/24/solid';
import type {
    CurrencyCode,
} from '~/generated/graphql';


interface ShippingMethod {
    id: string;
    name: string;
    description?: string | null;
    priceWithTax: number;
}

export function ShippingMethodSelector({
    eligibleShippingMethods,
    currencyCode,
    shippingMethodId,
    onChange,
}: {
    eligibleShippingMethods: ShippingMethod[];
    shippingMethodId: string | undefined;
    onChange: (value?: string) => void;
    currencyCode?: CurrencyCode;
}) {

    if (!eligibleShippingMethods || eligibleShippingMethods.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 font-display">
                    Shipping Method
                </h3>
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                    <TruckIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">
                        Please complete your shipping address to see available shipping methods.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 font-display mb-6">
                Shipping Method
            </h3>

            <RadioGroup value={shippingMethodId ?? null} onChange={onChange} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {eligibleShippingMethods.map((shippingMethod) => (
                        <Radio
                            key={shippingMethod.id}
                            value={shippingMethod.id}
                            className={({ checked }) =>
                                clsx(
                                    checked ? 'border-primary-500 bg-primary-50/30' : 'border-gray-200 bg-white',
                                    'relative border-2 rounded-xl p-4 flex cursor-pointer focus:outline-none hover:border-primary-200 transition-all group'
                                )
                            }
                        >
                            {({ checked }) => (
                                <>
                                    <div className="flex w-full items-start gap-3">
                                        <div className={clsx(
                                            "p-2 rounded-lg flex-shrink-0 transition-colors",
                                            checked ? "bg-primary-100 text-primary-600" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                                        )}>
                                            <TruckIcon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <span className={clsx(
                                                    "block text-sm font-bold text-gray-900 leading-tight",
                                                    checked ? "text-primary-700" : ""
                                                )}>
                                                    {shippingMethod.name}
                                                </span>
                                                {checked && (
                                                    <CheckCircleIcon
                                                        className="h-5 w-5 text-primary-600 flex-shrink-0"
                                                        aria-hidden="true"
                                                    />
                                                )}
                                            </div>
                                            {shippingMethod.description && (
                                                <span className="mt-1 block text-xs text-gray-500 leading-relaxed italic">
                                                    {shippingMethod.description}
                                                </span>
                                            )}
                                            <div className="mt-3">
                                                <span className="text-sm font-black text-primary-600">
                                                    <Price
                                                        priceWithTax={shippingMethod.priceWithTax}
                                                        currencyCode={currencyCode}
                                                    />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </Radio>
                    ))}
                </div>
            </RadioGroup>
        </div>
    );
}
