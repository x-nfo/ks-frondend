/**
 * Midtrans Payment Types for Storefront
 */

export type MidtransPaymentType =
    | 'credit_card'
    | 'bank_transfer'
    | 'echannel'
    | 'gopay'
    | 'shopeepay'
    | 'qris'
    | 'cstore';

export type MidtransBankType = 'bca' | 'bni' | 'bri' | 'permata' | 'cimb' | 'bsi' | 'mandiri';

export type MidtransStoreType = 'alfamart' | 'indomaret';

export interface MidtransVaNumber {
    bank: string;
    vaNumber: string;
}

export interface MidtransAction {
    name: string;
    method: string;
    url: string;
}

export interface MidtransPaymentData {
    transactionId: string;
    orderId: string;
    paymentType: MidtransPaymentType;
    transactionStatus: string;
    grossAmount: string;
    expiryTime?: string;

    // Bank Transfer
    vaNumbers?: MidtransVaNumber[];
    permataVaNumber?: string;

    // Mandiri Bill
    billKey?: string;
    billerCode?: string;

    // E-Wallet
    actions?: MidtransAction[];

    // QRIS
    qrString?: string;

    // Convenience Store
    paymentCode?: string;
    store?: string;

    // Credit Card
    redirectUrl?: string;
}

export interface MidtransClientConfig {
    clientKey: string;
    snapJsUrl: string;
    environment: string;
}

export const PAYMENT_TYPE_LABELS: Record<MidtransPaymentType, string> = {
    credit_card: 'Credit/Debit Card',
    bank_transfer: 'Bank Transfer (Virtual Account)',
    echannel: 'Mandiri Bill Payment',
    gopay: 'GoPay',
    shopeepay: 'ShopeePay',
    qris: 'QRIS',
    cstore: 'Convenience Store',
};

export const BANK_LABELS: Record<MidtransBankType, string> = {
    bca: 'BCA Virtual Account',
    bni: 'BNI Virtual Account',
    bri: 'BRI Virtual Account',
    permata: 'Permata Virtual Account',
    cimb: 'CIMB Niaga Virtual Account',
    bsi: 'Bank Syariah Indonesia (BSI)',
    mandiri: 'Mandiri Bill Payment',
};

export const STORE_LABELS: Record<MidtransStoreType, string> = {
    alfamart: 'Alfamart',
    indomaret: 'Indomaret',
};
