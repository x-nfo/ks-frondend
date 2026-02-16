import type { ShippingFormData } from '../types';

export function shippingFormDataIsValid(
    data: FormData | Record<string, string>,
): boolean {
    const shippingFormData = (
        data instanceof FormData ? Object.fromEntries<any>(data.entries()) : data
    ) as ShippingFormData;
    return !!(
        shippingFormData.fullName &&
        shippingFormData.streetLine1 &&
        shippingFormData.city &&
        shippingFormData.countryCode &&
        shippingFormData.province &&
        shippingFormData.postalCode &&
        shippingFormData.phoneNumber
    );
}

export function replaceEmptyString(input: string | undefined | null) {
    if (!input || input.trim().length == 0) {
        return '-';
    }
    return input;
}
