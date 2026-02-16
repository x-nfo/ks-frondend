import { useState, useEffect } from 'react';
import { useFetcher } from 'react-router';
import { useCheckout } from '../CheckoutProvider';

import { CheckCircleIcon, TruckIcon, MapIcon } from '@heroicons/react/24/outline';
import { DestinationSelector } from '~/components/checkout/DestinationSelector';
import { RajaOngkirShippingSelector } from '~/components/checkout/RajaOngkirShippingSelector';
import { useRajaOngkir } from '~/hooks/useRajaOngkir';
import { clsx } from 'clsx';
import { Price } from '~/components/products/Price';
import { CurrencyCode } from '~/generated/graphql';

export function DeliveryStep() {
    const {
        activeOrder,
        stepsStatus,
        goToStep,
        completeStep,
        eligibleShippingMethods,
        activeOrderFetcher: globalFetcher,
        isLoading
    } = useCheckout();

    const localFetcher = useFetcher<any>();

    const isCompleted = stepsStatus.delivery === 'completed';
    const isCurrent = stepsStatus.delivery === 'current';
    const isActive = isCurrent;
    const isDisabled = stepsStatus.delivery === 'pending';

    const currentShippingMethod = activeOrder?.shippingLines?.[0]?.shippingMethod;

    // We only use destination searching from hook, not rate calculation
    const {
        searchDestinations,
        selectedDestination,
        setSelectedDestination,
        isLoadingShipping: isSearchingDestinations,
    } = useRajaOngkir();

    const [selectedShippingOptionId, setSelectedShippingOptionId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sync available options from eligibleShippingMethods
    const availableShippingOptions = eligibleShippingMethods.map(method => {
        const m = method as any;
        return {
            id: m.id,
            courierCode: m.metadata?.courierCode || 'custom',
            courierName: m.name,
            service: m.metadata?.service || (m.name.includes(' ') ? m.name.split(' ').pop() : 'STD'),
            description: m.description,
            cost: m.price || 0,
            etd: m.metadata?.etd || ''
        };
    });

    // Handle Destination Change
    const handleDestinationSelect = (destination: any) => {
        setSelectedDestination(destination);

        if (destination?.id) {
            // Update backend with new destination to recalculate eligible shipping methods
            const formData = new FormData();
            formData.append('action', 'setRajaOngkirDestination');
            formData.append('rajaOngkirDestinationId', destination.id.toString());

            // Use global fetcher for destination updates (background sync)
            globalFetcher.submit(formData, { method: 'post', action: '/api/active-order' });
        }
    };

    const handleShippingMethodChange = (option: any) => {
        setSelectedShippingOptionId(option.id);
    };

    const handleContinue = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const methodId = selectedShippingOptionId || currentShippingMethod?.id;

        if (methodId) {
            setIsSubmitting(true);
            const formData = new FormData();
            formData.append('action', 'setShippingMethod');
            formData.append('shippingMethodId', methodId);

            // Redundant safety: send destination ID again
            if (selectedDestination?.id) {
                formData.append('rajaOngkirDestinationId', selectedDestination.id.toString());
            }

            localFetcher.submit(formData, { method: 'post', action: '/api/active-order' });
        }
    };

    // Watch for submission completion
    useEffect(() => {
        if (isSubmitting && localFetcher.state === 'idle') {
            setIsSubmitting(false);

            const returnedOrder = localFetcher.data?.activeOrder;
            const localSuccess = (returnedOrder?.shippingLines?.length ?? 0) > 0;
            const propSuccess = (activeOrder?.shippingLines?.length ?? 0) > 0;

            if (localSuccess || propSuccess) {
                if (globalFetcher.state === 'idle') {
                    globalFetcher.load('/api/active-order');
                }
                completeStep('delivery');
            }
        }
    }, [localFetcher.state, localFetcher.data, activeOrder, isSubmitting, completeStep, globalFetcher]);

    const renderHeader = () => (
        <div
            className={clsx(
                "py-6 px-0 flex items-center justify-between transition-all border-b border-gray-100",
                isCompleted ? "cursor-pointer" : ""
            )}
            onClick={() => isCompleted && goToStep('delivery')}
        >
            <div className="flex items-start gap-4">
                <div>
                    <h2 className={clsx(
                        "text-base font-bold font-sans leading-tight",
                        isDisabled ? "text-gray-400" : "text-karima-brand"
                    )}>3. Shipping</h2>
                    {isActive && <p className={clsx(
                        "text-xs mt-1 font-medium italic font-sans",
                        isDisabled ? "text-gray-300" : "text-karima-ink/60"
                    )}>Choose your preferred shipping.</p>}
                </div>
            </div>
            {isCompleted && !isActive && (
                <div className="text-right animate-in fade-in slide-in-from-right-2 duration-300">
                    <p className="text-sm font-bold text-karima-brand leading-tight font-sans">{currentShippingMethod?.name}</p>
                    <p className="text-xs text-karima-brand font-black font-sans">
                        <Price priceWithTax={activeOrder?.shippingWithTax || 0} currencyCode={activeOrder?.currencyCode || CurrencyCode.Idr} />
                    </p>
                    <button className="text-[10px] underline text-karima-ink/40 hover:text-karima-brand mt-1">Change</button>
                </div>
            )}
        </div>
    );

    const canContinue = !!selectedShippingOptionId || !!currentShippingMethod;

    const savedDestinationId = (activeOrder?.shippingAddress as any)?.customFields?.rajaOngkirDestinationId;
    const [selectedDestinationId, setSelectedDestinationId] = useState<string | number | null>(savedDestinationId || null);

    // Auto-load rates if destination is already set in Step 2 (saved in customFields)
    useEffect(() => {
        // If we have a saved ID but no selected destination yet, sync the ID state
        if (savedDestinationId && selectedDestinationId !== savedDestinationId) {
            setSelectedDestinationId(savedDestinationId);
        }

        // If we have an ID but no shipping options yet, trigger a refresh to get them
        if (savedDestinationId && availableShippingOptions.length === 0 && !isLoading && !isSearchingDestinations && globalFetcher.state === 'idle') {
            const formData = new FormData();
            formData.append('action', 'setRajaOngkirDestination');
            formData.append('rajaOngkirDestinationId', savedDestinationId.toString());
            globalFetcher.submit(formData, { method: 'post', action: '/api/active-order' });
        }
    }, [savedDestinationId, availableShippingOptions.length, isLoading, isSearchingDestinations, globalFetcher, selectedDestinationId]);

    return (
        <div className={clsx(
            "bg-transparent rounded-none transition-all duration-300 overflow-hidden mb-2",
            isActive ? "" : "",
            isDisabled ? "opacity-40 grayscale" : ""
        )}>
            {renderHeader()}

            {isActive && (
                <div className="pb-10 pt-4 px-0 lg:px-0 animate-in fade-in slide-in-from-top-4 duration-500 space-y-8">
                    {/* Only show selector if no destination is set yet */}
                    {!selectedDestinationId && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-xs font-black text-karima-ink/40 uppercase tracking-widest font-sans">
                                <MapIcon className="w-4 h-4" /> Search Delivery Area
                            </div>
                            <DestinationSelector
                                selectedDestination={selectedDestination}
                                onSelect={handleDestinationSelect}
                                onSearch={searchDestinations}
                                initialQuery={activeOrder?.shippingAddress?.postalCode || ''}
                            />
                        </div>
                    )}

                    {/* Show summary if destination is already known */}
                    {selectedDestinationId && !selectedDestination && activeOrder?.shippingAddress?.city && (
                        <div className="p-4 bg-karima-brand/5 border border-karima-brand/10 rounded-sm flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="w-10 h-10 bg-karima-brand/10 rounded-none flex items-center justify-center text-karima-brand flex-shrink-0">
                                <MapIcon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-karima-brand uppercase tracking-widest mb-1 font-sans">
                                    Shipping Location (From Address)
                                </p>
                                <p className="text-sm font-bold text-karima-ink leading-tight font-sans">
                                    {activeOrder.shippingAddress.city}, {activeOrder.shippingAddress.province} {activeOrder.shippingAddress.postalCode}
                                </p>
                                <button
                                    onClick={() => setSelectedDestinationId(null)}
                                    className="text-[10px] underline text-karima-ink/40 hover:text-karima-brand mt-1"
                                >
                                    Change destination
                                </button>
                            </div>
                        </div>
                    )}

                    {(selectedDestination || (selectedDestinationId && availableShippingOptions.length > 0)) && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex items-center gap-2 text-xs font-black text-karima-ink/40 uppercase tracking-widest mb-4 font-sans">
                                <TruckIcon className="w-4 h-4" /> Available Shipping Options
                            </div>
                            <RajaOngkirShippingSelector
                                shippingOptions={availableShippingOptions}
                                selectedOptionId={selectedShippingOptionId || currentShippingMethod?.id || null}
                                onChange={handleShippingMethodChange}
                                isLoading={isLoading || isSearchingDestinations}
                            />
                        </div>
                    )}

                    <div className="pt-4 border-t border-karima-brand/5">
                        <button
                            type="button"
                            onClick={handleContinue}
                            disabled={!canContinue || isLoading || isSubmitting}
                            className="w-full bg-black hover:bg-karima-brand/90 text-white py-4 px-6 rounded-sm shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none disabled:cursor-not-allowed font-sans"
                        >
                            {isLoading || isSubmitting ? "Loading..." : "Continue to Payment"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
