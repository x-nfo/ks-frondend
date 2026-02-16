import type { CurrencyCode } from '~/generated/graphql';

export function Price({
    priceWithTax,
    currencyCode,
}: {
    priceWithTax?: number | any;
    currencyCode?: CurrencyCode;
}) {
    if (priceWithTax == null || !currencyCode) {
        return <></>;
    }
    if (typeof priceWithTax === 'number') {
        return <>{formatPrice(priceWithTax, currencyCode)}</>;
    }
    if ('value' in priceWithTax) {
        return <>{formatPrice(priceWithTax.value, currencyCode)}</>;
    }
    if (priceWithTax.min === priceWithTax.max) {
        return <>{formatPrice(priceWithTax.min, currencyCode)}</>;
    }
    return (
        <>
            {formatPrice(priceWithTax.min, currencyCode)} -{' '}
            {formatPrice(priceWithTax.max, currencyCode)}
        </>
    );
}

export function formatPrice(value: number, currency: CurrencyCode) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency,
    }).format(value / 100);
}
