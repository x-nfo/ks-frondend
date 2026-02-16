import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import type { MidtransPaymentData } from './types';
import { BANK_LABELS, STORE_LABELS, PAYMENT_TYPE_LABELS } from './types';

interface PaymentInstructionsProps {
    paymentData: MidtransPaymentData;
    currencyCode: string;
}

export function PaymentInstructions({
    paymentData,
    currencyCode,
}: PaymentInstructionsProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const formatCurrency = (amount: string | number) => {
        const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: currencyCode || 'IDR',
            minimumFractionDigits: 0,
        }).format(numericAmount);
    };

    const formatExpiryTime = (expiryTime?: string) => {
        if (!expiryTime) return null;
        const date = new Date(expiryTime);
        return date.toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };

    const copyToClipboard = async (text: string, field: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const CopyButton = ({ text, field }: { text: string; field: string }) => (
        <button
            type="button"
            onClick={() => copyToClipboard(text, field)}
            className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Copy"
        >
            {copiedField === field ? (
                <CheckIcon className="h-5 w-5 text-green-500" />
            ) : (
                <ClipboardDocumentIcon className="h-5 w-5" />
            )}
        </button>
    );

    // Helper to get property by both snake_case and camelCase
    const getProp = (obj: any, key: string) => {
        if (!obj) return undefined;
        if (obj[key] !== undefined) return obj[key];
        // Convert camelCase to snake_case if needed
        const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
        if (obj[snakeKey] !== undefined) return obj[snakeKey];
        return undefined;
    };

    const paymentType = getProp(paymentData, 'paymentType');
    const grossAmount = getProp(paymentData, 'grossAmount');
    const expiryTime = getProp(paymentData, 'expiryTime');

    // Extract Mandiri Bill Payment details first as they might come under 'bank_transfer'
    const billKey = getProp(paymentData, 'billKey') || getProp(paymentData, 'bill_key');
    const billerCode = getProp(paymentData, 'billerCode') || getProp(paymentData, 'biller_code');

    // Mandiri Bill Payment (Check this FIRST before generic bank transfer)
    if (paymentType === 'echannel' || (billKey && billerCode)) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-left">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 font-sans">
                    Mandiri Bill Payment
                </h3>

                <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 font-sans">Biller Code</p>
                        <div className="flex items-center justify-between">
                            <span className="text-xl font-mono font-black text-gray-900">
                                {billerCode}
                            </span>
                            <CopyButton text={billerCode || ''} field="biller" />
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 font-sans">Bill Key Number</p>
                        <div className="flex items-center justify-between">
                            <span className="text-xl font-mono font-black text-gray-900">
                                {billKey}
                            </span>
                            <CopyButton text={billKey} field="billkey" />
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 font-sans">Total Amount</p>
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-black text-karima-ink">
                                {formatCurrency(grossAmount)}
                            </span>
                            <CopyButton text={String(grossAmount)} field="amount" />
                        </div>
                    </div>

                    {expiryTime && (
                        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                            <p className="text-[10px] font-bold text-yellow-800 uppercase tracking-widest text-center font-sans">
                                ⏰ Pay before: {formatExpiryTime(expiryTime)}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Bank Transfer Instructions
    if (paymentType === 'bank_transfer' || paymentType === 'permata') {
        const vaNumbers = getProp(paymentData, 'vaNumbers') || getProp(paymentData, 'va_numbers');
        const permataVaNumber = getProp(paymentData, 'permataVaNumber') || getProp(paymentData, 'permata_va_number');
        const vaNumberDirect = getProp(paymentData, 'vaNumber') || getProp(paymentData, 'va_number');

        // Permata specific logic: often returned in permataVaNumber even for bank_transfer type
        const bank = (getProp(vaNumbers?.[0], 'bank') || getProp(paymentData, 'bank') || '').toLowerCase();

        if (bank === 'permata' || paymentType === 'permata' || permataVaNumber) {
            const finalPermataVa = permataVaNumber || vaNumberDirect || vaNumbers?.[0]?.vaNumber || vaNumbers?.[0]?.va_number;

            if (finalPermataVa) {
                return (
                    <div className="bg-white rounded-lg border border-gray-200 p-6 text-left">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 font-sans">
                            Transfer to Permata Bank
                        </h3>

                        <div className="space-y-4">
                            <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 font-sans">Virtual Account Number</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-mono font-black text-karima-brand">
                                        {finalPermataVa}
                                    </span>
                                    <CopyButton text={finalPermataVa} field="va" />
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 font-sans">Total Amount</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-black text-karima-ink">
                                        {formatCurrency(grossAmount)}
                                    </span>
                                    <CopyButton text={String(grossAmount)} field="amount" />
                                </div>
                            </div>

                            {expiryTime && (
                                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                                    <p className="text-[10px] font-bold text-yellow-800 uppercase tracking-widest text-center font-sans">
                                        ⏰ Pay before: {formatExpiryTime(expiryTime)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            }
        }

        // Other banks
        if ((vaNumbers && vaNumbers.length > 0) || vaNumberDirect) {
            const va = vaNumbers?.[0] || {};
            const bankName = BANK_LABELS[bank as keyof typeof BANK_LABELS] || bank || 'Bank';
            const vaNumber = vaNumberDirect || getProp(va, 'vaNumber') || getProp(va, 'va_number');

            return (
                <div className="bg-white rounded-lg border border-gray-200 p-6 text-left">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 font-sans">
                        Transfer to {bankName}
                    </h3>

                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 font-sans">Virtual Account Number</p>
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-mono font-black text-karima-brand">
                                    {vaNumber}
                                </span>
                                <CopyButton text={vaNumber} field="va" />
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 font-sans">Total Amount</p>
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-black text-karima-ink">
                                    {formatCurrency(grossAmount)}
                                </span>
                                <CopyButton text={String(grossAmount)} field="amount" />
                            </div>
                        </div>

                        {expiryTime && (
                            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                                <p className="text-[10px] font-bold text-yellow-800 uppercase tracking-widest text-center font-sans">
                                    ⏰ Pay before: {formatExpiryTime(expiryTime)}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }
    }



    // QRIS & E-Wallet (GoPay, ShopeePay)
    if (paymentType === 'qris' || paymentType === 'gopay' || paymentType === 'shopeepay') {
        const actions = getProp(paymentData, 'actions');
        const qrAction = actions?.find((a: any) =>
            ['generate-qr-code', 'generate-qr-code-v2'].includes(getProp(a, 'name'))
        );
        const deeplinkAction = actions?.find((a: any) => getProp(a, 'name') === 'deeplink-redirect');

        const label = PAYMENT_TYPE_LABELS[paymentType as keyof typeof PAYMENT_TYPE_LABELS] || 'E-Wallet';

        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-left">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Pay with {label}
                </h3>

                <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                        <span className="text-2xl font-bold text-primary-600">
                            {formatCurrency(grossAmount)}
                        </span>
                    </div>

                    {qrAction && (
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-3 font-medium">
                                Scan this QR Code to pay:
                            </p>
                            <div className="inline-block bg-white p-4 border-2 border-primary-50 rounded-2xl shadow-sm">
                                <img src={getProp(qrAction, 'url')} alt={`${label} QR Code`} className="w-56 h-56 mx-auto" />
                            </div>
                        </div>
                    )}

                    {deeplinkAction && (
                        <div className="pt-2">
                            <a
                                href={getProp(deeplinkAction, 'url')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-flex items-center justify-center px-6 py-4 border border-transparent text-base font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all hover:-translate-y-0.5"
                            >
                                📱 Open {label} App
                            </a>
                            <p className="text-[10px] text-gray-400 text-center mt-2 uppercase tracking-widest font-bold">
                                Click to pay directly via app
                            </p>
                        </div>
                    )}

                    {expiryTime && (
                        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                            <p className="text-xs text-yellow-800 font-medium text-center">
                                ⏰ Please complete payment before:<br />
                                <strong className="text-sm">{formatExpiryTime(expiryTime)}</strong>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Convenience Store
    if (paymentType === 'cstore') {
        const paymentCode = getProp(paymentData, 'paymentCode');
        const store = getProp(paymentData, 'store');
        const storeName =
            STORE_LABELS[store?.toLowerCase() as keyof typeof STORE_LABELS] || store;

        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-left">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Pay at {storeName}
                </h3>

                <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500 mb-1">Payment Code</p>
                        <div className="flex items-center">
                            <span className="text-2xl font-mono font-bold text-gray-900">
                                {paymentCode}
                            </span>
                            <CopyButton text={paymentCode} field="paymentCode" />
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                        <span className="text-2xl font-bold text-primary-600">
                            {formatCurrency(grossAmount)}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // Default
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-left">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Waiting for Payment
            </h3>
            <p className="text-gray-600">
                Please complete your payment according to the instructions provided.
            </p>
            {process.env.NODE_ENV !== 'production' && (
                <div className="mt-8 p-4 bg-gray-100 rounded-lg text-[10px] font-mono border border-gray-300">
                    <p className="font-bold mb-2">DEBUG: Payment Data</p>
                    <pre className="whitespace-pre-wrap overflow-auto max-h-60">
                        {JSON.stringify(paymentData, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
