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

    // Watch for successful payment and redirect to confirmation
    useEffect(() => {
        if (fetcher.data?.success && fetcher.data?.orderCode) {
            navigate(`/checkout/confirmation/${fetcher.data.orderCode}`, {
                viewTransition: true
            });
        }
    }, [fetcher.data, navigate]);

    const isCurrent = stepsStatus.payment === 'current';
    const isActive = isCurrent;
    const isDisabled = stepsStatus.payment === 'pending';

    const [useSameAsShipping, setUseSameAsShipping] = useState(true);
    const [billingAddressData, setBillingAddressData] = useState<any>(activeOrder?.shippingAddress);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
    const [paymentMetadata, setPaymentMetadata] = useState<string>('');

    const shippingAddress = activeOrder?.shippingAddress;

    // Use the total from the API (backend) as the source of truth
    const orderTotal = activeOrder?.totalWithTax ?? 0;

    const handleBillingAddressChange = (useSame: boolean, address?: any) => {
        setUseSameAsShipping(useSame);
        setBillingAddressData(useSame ? shippingAddress : address);
    };

    const hasBillingAddress = !!((useSameAsShipping && shippingAddress) || (!useSameAsShipping && billingAddressData));
    const canCompleteOrder = hasBillingAddress && !!selectedPaymentMethod;

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
                    <BillingAddressSection
                        availableCountries={availableCountries.map(c => ({ ...c, id: c.code })) as any}
                        shippingAddress={shippingAddress as any}
                        billingAddress={billingAddressData}
                        onBillingAddressChange={handleBillingAddressChange}
                        defaultFullName={activeOrder?.customer ? `${activeOrder.customer.firstName} ${activeOrder.customer.lastName}` : ''}
                    />

                    <div className="space-y-4">
                        <h3 className="text-sm font-black text-karima-ink/40 uppercase tracking-widest border-l-4 border-karima-brand pl-4 font-sans">Select Payment Method</h3>
                        {eligiblePaymentMethods.length === 0 && (
                            <p className="text-red-500 text-sm italic">No payment methods available.</p>
                        )}
                        <div className="grid gap-4">
                            {/* Render Midtrans selection once if any midtrans method is eligible */}
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

                            {/* Render other (non-midtrans) payment methods if any */}
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

                    <fetcher.Form method="post" action="/api/active-order" className="mt-8">
                        <input type="hidden" name="action" value="completeOrder" />
                        <input type="hidden" name="paymentMethodCode" value={selectedPaymentMethod} />
                        {paymentMetadata && <input type="hidden" name="midtransMetadata" value={paymentMetadata} />}

                        {/* 
                          We also pass billing address info in the form so the action can set it 
                          if needed (although docs might not do it, it's safer for our backend)
                        */}
                        {!useSameAsShipping && billingAddressData && (
                            <>
                                <input type="hidden" name="billingAddress_fullName" value={billingAddressData.fullName || ''} />
                                <input type="hidden" name="billingAddress_streetLine1" value={billingAddressData.streetLine1 || ''} />
                                <input type="hidden" name="billingAddress_city" value={billingAddressData.city || ''} />
                                <input type="hidden" name="billingAddress_province" value={billingAddressData.province || ''} />
                                <input type="hidden" name="billingAddress_postalCode" value={billingAddressData.postalCode || ''} />
                                <input type="hidden" name="billingAddress_countryCode" value={billingAddressData.countryCode || ''} />
                                <input type="hidden" name="billingAddress_phoneNumber" value={billingAddressData.phoneNumber || ''} />
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={!canCompleteOrder || isSubmitting || isGlobalLoading}
                            className="w-full bg-black hover:bg-karima-brand/90 text-white py-4 px-6 rounded-sm shadow-xl text-sm font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-karima-brand disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 font-sans"
                        >
                            {isSubmitting ? "Processing Payment..." : "Complete Order"}
                        </button>

                        {fetcher.data?.error && (
                            <p className="mt-4 text-sm text-red-600 font-bold italic text-center">
                                Error: {typeof fetcher.data.error === 'string' ? fetcher.data.error : (fetcher.data.error.message || 'Payment failed')}
                            </p>
                        )}
                    </fetcher.Form>
                </div>
            )}
        </div>
    );
}
