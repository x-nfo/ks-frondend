import { useState, useEffect } from 'react';
import { useFetcher } from 'react-router';
import { useCheckout } from '../CheckoutProvider';

import { MapPinIcon, PlusIcon, BookmarkSquareIcon } from '@heroicons/react/24/outline';
import { ShippingAddressSelector } from '~/components/checkout/ShippingAddressSelector';
import { AddressForm } from '~/components/account/AddressForm';
import { shippingFormDataIsValid } from '~/utils/validation';
import { clsx } from 'clsx';

export function ShippingAddressStep() {
    const {
        activeOrder,
        activeCustomer,
        stepsStatus,
        goToStep,
        completeStep,
        activeOrderFetcher: globalFetcher,
        isLoading,
        availableCountries
    } = useCheckout();

    const localFetcher = useFetcher<any>();

    const isCompleted = stepsStatus.address === 'completed';
    const isCurrent = stepsStatus.address === 'current';
    const isActive = isCurrent;
    const isDisabled = stepsStatus.address === 'pending';

    const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
    const [isUsingSavedAddress, setIsUsingSavedAddress] = useState(!!activeCustomer && (activeCustomer.addresses?.length ?? 0) > 0);

    const addresses = activeCustomer?.addresses ?? [];
    const shippingAddress = activeOrder?.shippingAddress;

    // Default name fallback
    const defaultFullName = shippingAddress?.fullName ?? (activeOrder?.customer ? `${activeOrder.customer.firstName} ${activeOrder.customer.lastName}` : ``);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const submitAddressForm = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage(null);
        const formData = new FormData(event.currentTarget);
        if (shippingFormDataIsValid(formData)) {
            setIsSubmitting(true);
            localFetcher.submit(formData, { method: 'post', action: '/api/active-order' });
        }
    };

    const handleAddressSelect = (index: number) => {
        setSelectedAddressIndex(index);
        setErrorMessage(null);
    };

    const handleContinueSavedAddress = () => {
        const selectedAddress = addresses[selectedAddressIndex];
        if (selectedAddress) {
            // Validate saved address has required fields
            if (!selectedAddress.phoneNumber) {
                setErrorMessage('Selected address does not have a phone number. Please update or use a new address.');
                return;
            }
            setIsSubmitting(true);
            setErrorMessage(null);
            const formData = new FormData();
            const allowedFields = ['fullName', 'company', 'streetLine1', 'streetLine2', 'city', 'province', 'postalCode', 'phoneNumber'];
            allowedFields.forEach(field => {
                const value = (selectedAddress as any)[field];
                if (value) formData.append(field, value);
            });
            formData.append('countryCode', selectedAddress.country.code);
            const savedDestId = (selectedAddress as any).customFields?.rajaOngkirDestinationId;
            if (savedDestId) {
                formData.append('rajaOngkirDestinationId', savedDestId.toString());
            }
            formData.append('action', 'setCheckoutShipping');

            localFetcher.submit(formData, { method: 'post', action: '/api/active-order' });
        }
    };

    useEffect(() => {
        if (isSubmitting && localFetcher.state === 'idle') {
            setIsSubmitting(false);

            const fetcherError = localFetcher.data?.error;
            if (fetcherError) {
                setErrorMessage(fetcherError.message || 'Failed to save address. Please try again.');
                return;
            }

            const returnedOrder = localFetcher.data?.activeOrder;
            // Check local response first
            const localSuccess = returnedOrder?.shippingAddress?.streetLine1;
            // Check global prop
            const propSuccess = !!activeOrder?.shippingAddress?.streetLine1;

            if (localSuccess || propSuccess) {
                if (globalFetcher.state === 'idle') {
                    globalFetcher.load('/api/active-order');
                }
                completeStep('address');
            }
        }
    }, [localFetcher.state, localFetcher.data, activeOrder, isSubmitting, completeStep, globalFetcher]);

    const renderHeader = () => (
        <div
            className={clsx(
                "py-6 px-0 flex items-center justify-between transition-all border-b border-gray-100",
                isCompleted ? "cursor-pointer" : ""
            )}
            onClick={() => isCompleted && goToStep('address')}
        >
            <div className="flex items-start gap-4">
                <div>
                    <h2 className={clsx(
                        "text-base font-bold font-sans leading-tight",
                        isDisabled ? "text-gray-400" : "text-karima-brand"
                    )}>2. Delivery Details</h2>
                    {isActive && <p className={clsx(
                        "text-xs mt-1 font-medium italic font-sans",
                        isDisabled ? "text-gray-300" : "text-karima-ink/60"
                    )}>Where should we send your order?</p>}
                </div>
            </div>
            {isCompleted && !isActive && (
                <div className="text-right animate-in fade-in slide-in-from-right-2 duration-300">
                    <p className="text-sm font-bold text-karima-brand leading-tight font-sans">{shippingAddress?.fullName}</p>
                    <p className="text-xs text-karima-ink/60 font-medium truncate max-w-[200px] font-sans">
                        {shippingAddress?.streetLine1}, {shippingAddress?.city}
                    </p>
                    <button className="text-[10px] underline text-karima-ink/40 hover:text-karima-brand mt-1">Change</button>
                </div>
            )}
        </div>
    );

    return (
        <div className={clsx(
            "bg-transparent rounded-none transition-all duration-300 overflow-hidden mb-2",
            isActive ? "" : "",
            isDisabled ? "opacity-40 grayscale" : ""
        )}>
            {renderHeader()}

            {isActive && (
                <div className="pb-10 pt-4 px-0 lg:px-0 animate-in fade-in slide-in-from-top-4 duration-500">
                    <form onSubmit={submitAddressForm}>
                        <input type="hidden" name="action" value="setCheckoutShipping" />

                        {isUsingSavedAddress ? (
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 text-xs font-black text-karima-ink/40 uppercase tracking-widest font-sans">
                                    <BookmarkSquareIcon className="w-4 h-4" /> Select Saved Address
                                </div>

                                <ShippingAddressSelector
                                    addresses={addresses as any}
                                    selectedAddressIndex={selectedAddressIndex}
                                    onChange={handleAddressSelect}
                                />

                                <div className="flex justify-center">
                                    <button
                                        type="button"
                                        className="text-sm font-bold text-karima-brand hover:text-karima-brand/80 flex items-center gap-2 group p-2 rounded-lg hover:bg-karima-brand/5 transition-all font-sans"
                                        onClick={() => setIsUsingSavedAddress(false)}
                                    >
                                        <PlusIcon className="w-4 h-4 transition-transform group-hover:rotate-90" />
                                        Add New Address
                                    </button>
                                </div>

                                {errorMessage && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                                        <p className="text-sm font-medium text-red-700">{errorMessage}</p>
                                    </div>
                                )}

                                <div className="pt-4">
                                    <button
                                        type="button"
                                        onClick={handleContinueSavedAddress}
                                        disabled={isLoading || isSubmitting}
                                        className="w-full bg-karima-brand hover:bg-karima-brand/90 text-white py-4 px-6 rounded-sm shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0 font-sans"
                                    >
                                        {isLoading || isSubmitting ? "Loading..." : "Continue to Delivery"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs font-black text-karima-ink/40 uppercase tracking-widest font-sans">
                                        <MapPinIcon className="w-4 h-4" /> Enter New Address
                                    </div>
                                    {activeCustomer && (
                                        <button
                                            type="button"
                                            className="text-xs font-bold text-karima-brand hover:underline font-sans"
                                            onClick={() => setIsUsingSavedAddress(true)}
                                        >
                                            Back to Saved Addresses
                                        </button>
                                    )}
                                </div>

                                <AddressForm
                                    availableCountries={availableCountries as any}
                                    address={shippingAddress as any}
                                    defaultFullName={defaultFullName}
                                />


                                {errorMessage && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                                        <p className="text-sm font-medium text-red-700">{errorMessage}</p>
                                    </div>
                                )}

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isLoading || isSubmitting}
                                        className="w-full bg-black hover:bg-karima-brand/90 text-white py-4 px-6 rounded-sm shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0 font-sans"
                                    >
                                        {isLoading || isSubmitting ? "Loading..." : "Continue to Delivery"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div >
            )
            }
        </div >
    );
}
