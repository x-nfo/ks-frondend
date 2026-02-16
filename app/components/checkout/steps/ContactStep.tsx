import { type FormEvent, useState, useEffect } from 'react';
import { useFetcher, Link } from 'react-router';
import { useCheckout } from '../CheckoutProvider';

import { UserIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { FloatingLabelInput } from '../FloatingLabelInput';

export function ContactStep() {
    const {
        activeOrder,
        activeCustomer,
        stepsStatus,
        goToStep,
        completeStep,
        activeOrderFetcher: globalFetcher,
        isLoading
    } = useCheckout();

    const localFetcher = useFetcher<any>();
    const isCompleted = stepsStatus.contact === 'completed';
    const isCurrent = stepsStatus.contact === 'current';
    const isActive = isCurrent;

    // Local state for guest inputs to avoid jitter before sync
    const [guestEmail, setGuestEmail] = useState(activeOrder?.customer?.emailAddress || '');
    const [guestFirstName, setGuestFirstName] = useState(activeOrder?.customer?.firstName || '');
    const [guestLastName, setGuestLastName] = useState(activeOrder?.customer?.lastName || '');

    // Sync state with activeOrder changes
    useEffect(() => {
        if (activeOrder?.customer) {
            setGuestEmail(activeOrder.customer.emailAddress || '');
            setGuestFirstName(activeOrder.customer.firstName || '');
            setGuestLastName(activeOrder.customer.lastName || '');
        }
    }, [activeOrder?.customer]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage(null);
        const formData = new FormData(event.currentTarget);
        const { emailAddress, firstName, lastName } = Object.fromEntries(formData.entries());

        if (emailAddress && firstName && lastName) {
            setIsSubmitting(true);
            localFetcher.submit(formData, { method: 'post', action: '/api/active-order' });
        }
    };

    useEffect(() => {
        if (isSubmitting && localFetcher.state === 'idle') {
            setIsSubmitting(false);

            const fetcherData = localFetcher.data;
            const returnedOrder = fetcherData?.activeOrder;
            const fetcherError = fetcherData?.error;

            // Check for server errors (EmailAddressConflictError, AlreadyLoggedInError, etc.)
            if (fetcherError) {
                const errorCode = fetcherError.errorCode;
                if (errorCode === 'EMAIL_ADDRESS_CONFLICT_ERROR') {
                    setErrorMessage('This email is already registered. If you have shopped with us as a guest before, you might not have a password yet. Please use the "Forgot Password" link to set one.');
                } else if (errorCode === 'ALREADY_LOGGED_IN_ERROR') {
                    setErrorMessage('You are already logged in. Please refresh the page.');
                } else {
                    setErrorMessage(fetcherError.message || 'An error occurred. Please try again.');
                }
                return;
            }

            // Check local response first (fastest)
            const localSuccess = returnedOrder?.customer;
            // Check global prop (fallback if already updated)
            const propSuccess = !!(activeOrder?.customer?.emailAddress && activeOrder?.customer?.firstName);

            if (localSuccess || propSuccess) {
                // Force a global refresh if it hasn't happened yet, to sync header cart etc.
                if (globalFetcher.state === 'idle') {
                    globalFetcher.load('/api/active-order');
                }
                completeStep('contact');
            }
        }
    }, [localFetcher.state, localFetcher.data, activeOrder, isSubmitting, completeStep, globalFetcher]);

    const renderHeader = () => (
        <div
            className={clsx(
                "py-6 px-0 flex items-center justify-between transition-all border-b border-gray-100",
                isCompleted ? "cursor-pointer" : ""
            )}
            onClick={() => isCompleted && goToStep('contact')}
        >
            <div className="flex-1 flex items-center justify-between">
                <h2 className="text-base font-bold text-karima-brand font-sans leading-tight">1. Contact</h2>
                {isActive && !activeCustomer && (
                    <p className="text-sm text-karima-ink/60 font-sans hidden sm:block">
                        Already have an account? <Link to={`/sign-in?redirectTo=${encodeURIComponent('/checkout')}`} className="text-karima-brand font-bold underline hover:text-karima-brand/80">Log in</Link>
                    </p>
                )}
            </div>
            {isCompleted && (
                <div className="text-right animate-in fade-in slide-in-from-right-2 duration-300">
                    <p className="text-sm font-bold text-karima-brand leading-tight font-sans">
                        {activeCustomer?.firstName || guestFirstName} {activeCustomer?.lastName || guestLastName}
                    </p>
                    <p className="text-xs text-karima-ink/60 font-medium font-sans">{activeCustomer?.emailAddress || guestEmail}</p>
                    <button className="text-[10px] underline text-karima-ink/40 hover:text-karima-brand mt-1">Change</button>
                </div>
            )}
        </div>
    );

    if (activeCustomer && !isActive) {
        // Authenticated view when not current step
        return (
            <div className="bg-white rounded-none border-b border-karima-brand/10 overflow-hidden mb-6">
                {renderHeader()}
            </div>
        );
    }

    // Guest view
    return (
        <div className={clsx(
            "bg-transparent rounded-none transition-all duration-300 overflow-hidden mb-2",
            isActive ? "" : "",
            !isActive && !isCompleted ? "opacity-40 grayscale" : ""
        )}>
            {renderHeader()}

            {isActive && (
                <div className="pb-10 pt-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    {activeCustomer ? (
                        <>
                            <div className="space-y-6">
                                <div className="p-6 bg-karima-brand/5 border border-karima-brand/10 rounded-sm">
                                    <p className="text-sm text-karima-brand font-medium">
                                        Logged in as <span className="font-bold">{activeCustomer.emailAddress}</span>
                                    </p>
                                    <p className="text-xs text-karima-ink/60 mt-1">
                                        Name: {activeCustomer.firstName} {activeCustomer.lastName}
                                    </p>
                                </div>
                            </div>
                            <div className="pt-4">
                                <button
                                    onClick={() => completeStep('contact')}
                                    className="w-full bg-black hover:bg-karima-brand/90 text-white py-4 px-6 rounded-sm shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 font-sans"
                                >
                                    Continue to Shipping
                                </button>
                            </div>
                        </>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <input type="hidden" name="action" value="setOrderCustomer" />

                            <div className="space-y-6">
                                <FloatingLabelInput
                                    id="emailAddress"
                                    name="emailAddress"
                                    type="email"
                                    label="Email *"
                                    value={guestEmail}
                                    onChange={(e) => { setGuestEmail(e.target.value); setErrorMessage(null); }}
                                    required
                                    icon={null}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <FloatingLabelInput
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    label="First Name *"
                                    value={guestFirstName}
                                    onChange={(e) => setGuestFirstName(e.target.value)}
                                    required
                                    icon={null}
                                />
                                <FloatingLabelInput
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    label="Last Name *"
                                    value={guestLastName}
                                    onChange={(e) => setGuestLastName(e.target.value)}
                                    required
                                    icon={null}
                                />
                            </div>

                            {errorMessage && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                                    <p className="text-sm font-medium text-red-700">{errorMessage}</p>
                                    {errorMessage.includes('already registered') && (
                                        <div className="mt-2 flex flex-wrap gap-4">
                                            <Link
                                                to={`/sign-in?redirectTo=${encodeURIComponent('/checkout')}`}
                                                className="text-sm font-bold text-red-700 underline hover:text-red-900"
                                            >
                                                Sign In
                                            </Link>
                                            <Link
                                                to={`/forgot-password?email=${encodeURIComponent(guestEmail)}`}
                                                className="text-sm font-bold text-red-700 underline hover:text-red-900"
                                            >
                                                Forgot Password?
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading || isSubmitting}
                                    className="w-full bg-black hover:bg-karima-brand/90 text-white py-4 px-6 rounded-sm shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none font-sans"
                                >
                                    {isLoading || isSubmitting ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </>
                                    ) : (
                                        <>Next</>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )
            }
        </div >
    );
}
