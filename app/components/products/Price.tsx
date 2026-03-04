import type { CurrencyCode } from "~/generated/graphql";

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
  if (typeof priceWithTax === "number") {
    return <>{formatPrice(priceWithTax, currencyCode)}</>;
  }
  if ("value" in priceWithTax) {
    return <>{formatPrice(priceWithTax.value, currencyCode)}</>;
  }
  if (priceWithTax.min === priceWithTax.max) {
    return <>{formatPrice(priceWithTax.min, currencyCode)}</>;
  }
  return (
    <>
      {formatPrice(priceWithTax.min, currencyCode)} -{" "}
      {formatPrice(priceWithTax.max, currencyCode)}
    </>
  );
}

/**
 * ISO 4217 zero-decimal currencies.
 * These currencies have no subunits (no "cents"), so the integer value
 * stored by Vendure IS the actual price — no division needed.
 */
const ZERO_DECIMAL_CURRENCIES = new Set([
  "BIF", "CLP", "DJF", "GNF", "IDR", "JPY", "KMF", "KRW",
  "MGA", "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF",
]);

/**
 * Returns the precision (number of decimal places) for a given currency.
 * Zero-decimal currencies return 0, standard currencies return 2.
 */
export function getCurrencyPrecision(currencyCode: string): number {
  return ZERO_DECIMAL_CURRENCIES.has(currencyCode.toUpperCase()) ? 0 : 2;
}

export function formatPrice(
  value: number,
  currencyCode: CurrencyCode | string,
  locale: string = "id-ID",
) {
  const precision = getCurrencyPrecision(currencyCode as string);
  const divisor = Math.pow(10, precision);
  const majorUnits = value / divisor;

  try {
    const options: Intl.NumberFormatOptions = {
      style: "currency",
      currency: currencyCode as string,
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    };

    return new Intl.NumberFormat(locale, options).format(majorUnits);
  } catch (e: any) {
    return majorUnits.toFixed(precision);
  }
}
