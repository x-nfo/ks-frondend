import { useState, useEffect } from 'react';
import { useFetcher, useNavigate } from 'react-router';
import { useCheckout } from '../CheckoutProvider';
import { MidtransPayments } from '~/components/checkout/midtrans';
import { BillingAddressSection } from '~/components/checkout/BillingAddressSection';

import clsx from 'clsx';

export function PaymentStep() {
    const {
        activeOrder,
        eligiblePaymentMethods,
        availableCountries,
        stepsStatus,
        isLoading: isGlobalLoading
    } = useCheckout();

    const fetcher = useFetcher<any>();
    const navigate = useNavigate();
    const isSubmitting = fetcher.state === 'submitting';

    // Track if billing address is "saved/confirmed" for this step
    const [isBillingSaved, setIsBillingSaved] = useState(false);

    // Watch for successful billing save or payment
    useEffect(() => {
        if (fetcher.data?.activeOrder && !fetcher.data?.error) {
            // If the action was setOrderBillingAddress, we mark it as saved locally
            if (fetcher.formData?.get('action') === 'setOrderBillingAddress') {
                setIsBillingSaved(true);
            }
        }

        if (fetcher.data?.success && fetcher.data?.orderCode) {
            // Gunakan window.location untuk full navigation agar tidak terperangkap dalam nested route context
            window.location.href = `/checkout/confirmation/${fetcher.data.orderCode}`;
        }
    }, [fetcher.data, fetcher.formData, navigate]);

    // Reset saved state if user goes back to a previous step or order changes significantly
    useEffect(() => {
        if (stepsStatus.payment !== 'current') {
            setIsBillingSaved(false);
        }
    }, [stepsStatus.payment]);

    const isCurrent = stepsStatus.payment === 'current';
    const isActive = isCurrent;
    const isDisabled = stepsStatus.payment === 'pending';

    const [useSameAsShipping, setUseSameAsShipping] = useState(true);
    const [billingAddressData, setBillingAddressData] = useState<any>(activeOrder?.shippingAddress);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
    const [paymentMetadata, setPaymentMetadata] = useState<string>('');

    const shippingAddress = activeOrder?.shippingAddress;
    const orderTotal = activeOrder?.totalWithTax ?? 0;

    const handleBillingAddressChange = (useSame: boolean, address?: any) => {
        setUseSameAsShipping(useSame);
        setBillingAddressData(useSame ? shippingAddress : address);
    };

    const canCompleteOrder = !!selectedPaymentMethod;

    return (
        <div className={`bg-transparent sm:rounded-none transition-all duration-300 overflow-hidden mb-2 ${isActive ? '' : ''} ${isDisabled ? 'opacity-40 grayscale' : ''}`}>
            <div className="py-6 px-0 flex items-center justify-between border-b border-gray-100">
                <h2 className="text-base font-bold text-karima-brand font-sans flex items-center">
                    4. Payment
                </h2>
                {stepsStatus.payment === 'completed' && <div className="text-karima-brand font-bold text-xs uppercase tracking-widest font-sans">COMPLETED</div>}
            </div>

            {isActive && (
                <div className="pb-6 pt-4 px-0 lg:px-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">

                    {/* Phase 1: Billing Address */}
                    <div className={clsx("space-y-6", isBillingSaved && "opacity-50 pointer-events-none")}>
                        <BillingAddressSection
                            availableCountries={availableCountries.map(c => ({ ...c, id: c.code })) as any}
                            shippingAddress={shippingAddress as any}
                            billingAddress={billingAddressData}
                            onBillingAddressChange={handleBillingAddressChange}
                            defaultFullName={activeOrder?.customer ? `${activeOrder.customer.firstName} ${activeOrder.customer.lastName}` : ''}
                            namePrefix="billingAddress_"
                        />

                        {!isBillingSaved && (
                            <fetcher.Form method="post" action="/api/active-order">
                                <input type="hidden" name="action" value="setOrderBillingAddress" />
                                {useSameAsShipping ? (
                                    <>
                                        <input type="hidden" name="fullName" value={shippingAddress?.fullName || ''} />
                                        <input type="hidden" name="streetLine1" value={shippingAddress?.streetLine1 || ''} />
                                        <input type="hidden" name="streetLine2" value={shippingAddress?.streetLine2 || ''} />
                                        <input type="hidden" name="city" value={shippingAddress?.city || ''} />
                                        <input type="hidden" name="province" value={shippingAddress?.province || ''} />
                                        <input type="hidden" name="postalCode" value={shippingAddress?.postalCode || ''} />
                                        <input type="hidden" name="countryCode" value={shippingAddress?.countryCode || 'ID'} />
                                        <input type="hidden" name="phoneNumber" value={shippingAddress?.phoneNumber || ''} />
                                    </>
                                ) : (
                                    <>
                                        <input type="hidden" name="fullName" value={billingAddressData?.fullName || ''} />
                                        <input type="hidden" name="streetLine1" value={billingAddressData?.streetLine1 || ''} />
                                        <input type="hidden" name="streetLine2" value={billingAddressData?.streetLine2 || ''} />
                                        <input type="hidden" name="city" value={billingAddressData?.city || ''} />
                                        <input type="hidden" name="province" value={billingAddressData?.province || ''} />
                                        <input type="hidden" name="postalCode" value={billingAddressData?.postalCode || ''} />
                                        <input type="hidden" name="countryCode" value={billingAddressData?.countryCode || 'ID'} />
                                        <input type="hidden" name="phoneNumber" value={billingAddressData?.phoneNumber || ''} />
                                    </>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting || isGlobalLoading}
                                    className="w-full bg-karima-brand text-white py-4 px-8 rounded-none transition-all duration-300 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 font-sans disabled:opacity-50"
                                >
                                    {isSubmitting && fetcher.formData?.get('action') === 'setOrderBillingAddress'
                                        ? "Saving Address..."
                                        : "Confirm Billing Address"}
                                </button>
                            </fetcher.Form>
                        )}

                        {isBillingSaved && (
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setIsBillingSaved(false)}
                                    className="text-[10px] font-black uppercase tracking-widest text-karima-brand hover:underline"
                                >
                                    Edit Billing Address
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Phase 2: Payment Method */}
                    {isBillingSaved && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-karima-ink/40 uppercase tracking-widest border-l-4 border-karima-brand pl-4 font-sans">Select Payment Method</h3>
                                {eligiblePaymentMethods.length === 0 && (
                                    <p className="text-red-500 text-sm italic">No payment methods available.</p>
                                )}
                                <div className="grid gap-4">
                                    {eligiblePaymentMethods.some(p => p.code.includes('midtrans')) && (
                                        <MidtransPayments
                                            paymentMethodCode={eligiblePaymentMethods.find(p => p.code.includes('midtrans'))?.code || 'midtrans-payment'}
                                            currencyCode={activeOrder?.currencyCode ?? 'IDR'}
                                            totalAmount={orderTotal}
                                            paymentError={fetcher.data?.error}
                                            onPaymentSelect={(code, metadata) => {
                                                setSelectedPaymentMethod(code);
                                                setPaymentMetadata(metadata);
                                            }}
                                            hideSubmitButton={true}
                                        />
                                    )}

                                    {eligiblePaymentMethods.filter(p => !p.code.includes('midtrans')).map((paymentMethod) => (
                                        <div key={paymentMethod.id} className="p-4 border rounded-xl flex items-center justify-between">
                                            <span className="font-bold">{paymentMethod.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedPaymentMethod(paymentMethod.code)}
                                                className={clsx(
                                                    "px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest font-sans",
                                                    selectedPaymentMethod === paymentMethod.code ? "bg-karima-ink text-white" : "bg-gray-100 text-gray-600"
                                                )}
                                            >
                                                Select
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8">
                                <fetcher.Form method="post" action="/api/active-order">
                                    <input type="hidden" name="action" value="completeOrder" />
                                    <input type="hidden" name="paymentMethodCode" value={selectedPaymentMethod} />
                                    {paymentMetadata && <input type="hidden" name="midtransMetadata" value={paymentMetadata} />}

                                    <button
                                        type="submit"
                                        disabled={!canCompleteOrder || isSubmitting || isGlobalLoading}
                                        className="w-full bg-black hover:bg-karima-brand text-white py-4 px-8 rounded-none transition-all duration-300 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 font-sans disabled:opacity-50 disabled:cursor-not-allowed group"
                                    >
                                        {isSubmitting && fetcher.formData?.get('action') === 'completeOrder'
                                            ? "Processing Order..."
                                            : "Complete Order"}
                                    </button>
                                </fetcher.Form>

                                {fetcher.data?.error && (
                                    <p className="mt-4 text-sm text-red-600 font-bold italic text-center">
                                        Error: {typeof fetcher.data.error === 'string' ? fetcher.data.error : (fetcher.data.error.message || 'Payment failed')}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
