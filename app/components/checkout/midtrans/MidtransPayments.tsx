import { Form, useNavigation, useSubmit } from 'react-router';
import { useState, useEffect } from 'react';

import { XCircleIcon } from '@heroicons/react/24/solid';
import {
    type MidtransBankType,
    type MidtransPaymentType,
    type MidtransStoreType,
    BANK_LABELS,
    STORE_LABELS,
} from './types';

// Premium Logo URLs
const LOGOS = {
    visa: 'https://upload.wikimedia.org/wikipedia/commons/d/d6/Visa_2021.svg',
    mastercard: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg',
    jcb: 'https://upload.wikimedia.org/wikipedia/commons/4/40/JCB_logo.svg',
    amex: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg',
    bca: '/images/banks/bca_va.png',
    bni: '/images/banks/bni_va.png',
    bri: '/images/banks/bri_va.png',
    permata: '/images/banks/permata_va.svg',
    cimb: '/images/banks/cimb_va.png',
    mandiri: '/images/banks/mandiri_bill.png',
    gopay: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg',
    shopeepay: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/ShopeePay_logo.svg',
    qris: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg',
    indomaret: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Indomaret_logo.svg',
    alfamart: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Alfamart_logo.svg',
    alto: 'https://upload.wikimedia.org/wikipedia/id/8/87/Logo_ALTO.svg',
    atm_bersama: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/ATM_Bersama_logo.svg',
    prima: '/images/banks/prima.png',
    bsi: '/images/banks/bsi_va.svg',
};

const BANK_LOGOS: Record<string, string> = {
    bca: LOGOS.bca,
    bni: LOGOS.bni,
    bri: LOGOS.bri,
    permata: LOGOS.permata,
    cimb: LOGOS.cimb,
    bsi: LOGOS.bsi,
    mandiri: LOGOS.mandiri,
};

const STORE_LOGOS: Record<MidtransStoreType, string> = {
    indomaret: LOGOS.indomaret,
    alfamart: LOGOS.alfamart,
};

interface MidtransPaymentsProps {
    paymentMethodCode: string;
    currencyCode: string;
    totalAmount: number;
    paymentError?: string | { message?: string };
    onPaymentSelect?: (paymentMethodCode: string, metadata: string) => void;
    hideSubmitButton?: boolean;
}

type PaymentCategory = 'bank_transfer' | 'ewallet' | 'qris' | 'cstore';

export function MidtransPayments({
    paymentMethodCode,
    currencyCode,
    totalAmount,
    paymentError,
    onPaymentSelect,
    hideSubmitButton = false,
}: MidtransPaymentsProps) {
    const navigation = useNavigation();
    const submit = useSubmit();
    const isSubmitting = navigation.state === 'submitting';

    const [selectedCategory, setSelectedCategory] =
        useState<PaymentCategory | null>(null);
    const [selectedPaymentType, setSelectedPaymentType] =
        useState<MidtransPaymentType | null>(null);
    const [selectedBank, setSelectedBank] = useState<MidtransBankType>('bca');
    const [selectedStore, setSelectedStore] =
        useState<MidtransStoreType>('alfamart');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: currencyCode || 'IDR',
            minimumFractionDigits: 0,
        }).format(amount / 100);
    };

    const handleCategorySelect = (category: PaymentCategory) => {
        setSelectedCategory(category);
        // Auto-select payment type based on category
        switch (category) {
            case 'bank_transfer':
                setSelectedPaymentType('bank_transfer');
                break;
            case 'ewallet':
                setSelectedPaymentType('gopay');
                break;
            case 'qris':
                setSelectedPaymentType('qris');
                break;
            case 'cstore':
                setSelectedPaymentType('cstore');
                break;
        }
    };

    const getSubmitMetadata = () => {
        const metadata: Record<string, string> = {
            paymentType: selectedPaymentType || 'bank_transfer',
        };

        if (selectedPaymentType === 'bank_transfer') {
            metadata.bank = selectedBank;
        } else if (selectedPaymentType === 'cstore') {
            metadata.store = selectedStore;
        }

        return JSON.stringify(metadata);
    };

    // Notify parent component when payment selection changes (for one-page checkout)
    useEffect(() => {
        if (onPaymentSelect && selectedCategory) {
            onPaymentSelect(paymentMethodCode, getSubmitMetadata());
        }
    }, [selectedCategory, selectedPaymentType, selectedBank, selectedStore, onPaymentSelect, paymentMethodCode]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        submit(formData, { method: 'post' });
    };

    // Use a regular div when hidden, or a Form when standalone
    const Container = hideSubmitButton ? 'div' : Form;
    const containerProps = hideSubmitButton
        ? { className: "space-y-6" }
        : { method: "post" as const, className: "space-y-6", onSubmit: handleSubmit };


    return (
        <div className="w-full max-w-lg mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <Container {...(containerProps as any)}>
                {!hideSubmitButton && (
                    <>
                        <input
                            type="hidden"
                            name="paymentMethodCode"
                            value={paymentMethodCode}
                        />
                        <input
                            type="hidden"
                            name="midtransMetadata"
                            value={getSubmitMetadata()}
                        />
                    </>
                )}

                {paymentError && (
                    <div className="rounded-xl bg-red-50 p-4 mb-6 border border-red-100 flex gap-3 animate-in fade-in slide-in-from-top-2">
                        <XCircleIcon className="h-5 w-5 text-red-500 shrink-0" aria-hidden="true" />
                        <div>
                            <p className="text-sm font-bold text-red-800">Payment Failed</p>
                            <p className="text-xs text-red-700 mt-1">
                                {typeof paymentError === 'string' ? paymentError : (paymentError.message || 'An error occurred')}
                            </p>
                        </div>
                    </div>
                )}

                {/* Payment Categories */}
                <div className="space-y-4 mb-8">
                    {[
                        {
                            id: 'bank_transfer',
                            label: 'ATM/Bank Transfer',
                            sub: 'BSI, BCA, BNI, BRI, Permata, CIMB, Mandiri',
                            logos: [LOGOS.bsi, LOGOS.bca, LOGOS.bni, LOGOS.bri, LOGOS.mandiri]
                        },
                        {
                            id: 'ewallet',
                            label: 'eWallet',
                            sub: 'GoPay',
                            logos: [LOGOS.gopay]
                        },
                        {
                            id: 'qris',
                            label: 'QRIS',
                            sub: 'Scan with any app',
                            logos: [LOGOS.qris]
                        },
                        {
                            id: 'cstore',
                            label: 'Over the counter',
                            sub: 'Alfamart',
                            logos: [LOGOS.alfamart]
                        }
                    ].map((cat) => (
                        <div key={cat.id} className="group">
                            <button
                                type="button"
                                onClick={() => handleCategorySelect(cat.id as PaymentCategory)}
                                className={clsx(
                                    "w-full p-5 border rounded-xl text-left transition-all duration-300 flex items-center justify-between",
                                    selectedCategory === cat.id
                                        ? "border-karima-brand bg-white shadow-xl shadow-karima-brand/5 ring-1 ring-karima-brand/20"
                                        : "border-gray-100 bg-white hover:border-gray-300 hover:shadow-md"
                                )}
                            >
                                <div>
                                    <p className={clsx("text-sm font-bold transition-colors", selectedCategory === cat.id ? "text-karima-ink" : "text-gray-600")}>
                                        {cat.label}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 overflow-hidden px-1">
                                        {cat.logos.map((logo, i) => (
                                            <div key={i} className="h-10 w-auto flex items-center bg-white px-2 border border-gray-50 rounded-md shadow-sm">
                                                <img src={logo} alt="logo" className="h-6 w-auto object-contain" />
                                            </div>
                                        ))}
                                    </div>
                                    <svg
                                        className={clsx(
                                            "h-5 w-5 text-gray-400 transition-transform duration-300",
                                            selectedCategory === cat.id ? "rotate-90 text-karima-brand" : ""
                                        )}
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </button>

                            {/* Expandable sub-options */}
                            <div className={clsx(
                                "overflow-hidden transition-all duration-500 ease-in-out",
                                selectedCategory === cat.id ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"
                            )}>
                                <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-xl ml-4">
                                    {cat.id === 'bank_transfer' && (
                                        <div className="grid grid-cols-2 gap-2">
                                            {(Object.keys(BANK_LABELS) as MidtransBankType[]).map((bank) => (
                                                <button
                                                    key={bank}
                                                    type="button"
                                                    onClick={() => setSelectedBank(bank)}
                                                    className={clsx(
                                                        "p-3 bg-white border rounded-lg flex items-center gap-3 transition-all",
                                                        selectedBank === bank
                                                            ? "border-karima-brand ring-1 ring-karima-brand/30 shadow-sm"
                                                            : "border-gray-100 hover:border-gray-300"
                                                    )}
                                                >
                                                    <div className="w-20 h-10 flex items-center shrink-0">
                                                        <img src={BANK_LOGOS[bank]} alt={bank} className="max-h-full max-w-full object-contain mx-auto" />
                                                    </div>
                                                    <span className={clsx("text-[10px] font-bold uppercase tracking-tight", selectedBank === bank ? "text-karima-ink" : "text-gray-400")}>
                                                        {bank}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {cat.id === 'ewallet' && (
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { id: 'gopay' as const, label: 'GoPay', logo: LOGOS.gopay },
                                                // { id: 'shopeepay' as const, label: 'ShopeePay', logo: LOGOS.shopeepay } // Disabled
                                            ].map((wallet) => (
                                                <button
                                                    key={wallet.id}
                                                    type="button"
                                                    onClick={() => setSelectedPaymentType(wallet.id)}
                                                    className={clsx(
                                                        "p-3 bg-white border rounded-lg flex items-center gap-3 transition-all",
                                                        selectedPaymentType === wallet.id
                                                            ? "border-karima-brand ring-1 ring-karima-brand/30 shadow-sm"
                                                            : "border-gray-100 hover:border-gray-300"
                                                    )}
                                                >
                                                    <div className="w-20 h-10 flex items-center shrink-0">
                                                        <img src={wallet.logo} alt={wallet.label} className="max-h-full max-w-full object-contain mx-auto" />
                                                    </div>
                                                    <span className={clsx("text-[10px] font-bold uppercase tracking-tight", selectedPaymentType === wallet.id ? "text-karima-ink" : "text-gray-400")}>
                                                        {wallet.label}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {cat.id === 'qris' && (
                                        <div className="flex flex-col items-center p-4 bg-white border border-gray-100 rounded-lg">
                                            <img src={LOGOS.qris} alt="QRIS" className="h-14 object-contain mb-2" />
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                                                Pay with QRIS scanned by any e-wallet app
                                            </p>
                                        </div>
                                    )}

                                    {cat.id === 'cstore' && (
                                        <div className="grid grid-cols-2 gap-2">
                                            {(Object.keys(STORE_LABELS) as MidtransStoreType[])
                                                .filter(store => store !== 'indomaret') // Disable Indomaret
                                                .map((store) => (
                                                    <button
                                                        key={store}
                                                        type="button"
                                                        onClick={() => setSelectedStore(store)}
                                                        className={clsx(
                                                            "p-3 bg-white border rounded-lg flex items-center gap-3 transition-all",
                                                            selectedStore === store
                                                                ? "border-karima-brand ring-1 ring-karima-brand/30 shadow-sm"
                                                                : "border-gray-100 hover:border-gray-300"
                                                        )}
                                                    >
                                                        <div className="w-16 h-8 flex items-center shrink-0">
                                                            <img src={STORE_LOGOS[store]} alt={store} className="max-h-full max-w-full object-contain mx-auto" />
                                                        </div>
                                                        <span className={clsx("text-[10px] font-bold uppercase tracking-tight", selectedStore === store ? "text-karima-ink" : "text-gray-400")}>
                                                            {STORE_LABELS[store]}
                                                        </span>
                                                    </button>
                                                ))}
                                        </div>
                                    )}

                                    {/* Dedicated button for all methods (VA, E-Wallet, etc.) - Only if not hidden */}
                                    {!hideSubmitButton && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full py-3 px-4 bg-karima-ink hover:bg-black text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-md disabled:opacity-50"
                                            >
                                                {isSubmitting ? 'Processing...' : `Confirm & Pay with ${cat.label}`}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                </div>

                {/* Total Amount */}
                <div className="border-t-2 border-dashed border-gray-100 pt-6">
                    <div className="flex justify-between items-end">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Amount:</span>
                        <span className="text-3xl font-black text-gray-900 font-display">
                            {formatCurrency(totalAmount)}
                        </span>
                    </div>
                </div>

            </Container>
        </div>
    );
}

function clsx(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
