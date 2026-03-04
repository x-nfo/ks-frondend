import { describe, expect, it } from 'vitest';
import { formatPrice, getCurrencyPrecision } from './Price';

describe('getCurrencyPrecision', () => {
    it('returns 0 for IDR (zero-decimal)', () => {
        expect(getCurrencyPrecision('IDR')).toBe(0);
    });

    it('returns 0 for JPY (zero-decimal)', () => {
        expect(getCurrencyPrecision('JPY')).toBe(0);
    });

    it('returns 2 for USD (standard)', () => {
        expect(getCurrencyPrecision('USD')).toBe(2);
    });

    it('returns 2 for EUR (standard)', () => {
        expect(getCurrencyPrecision('EUR')).toBe(2);
    });

    it('handles lowercase currency codes', () => {
        expect(getCurrencyPrecision('idr')).toBe(0);
        expect(getCurrencyPrecision('usd')).toBe(2);
    });
});

describe('formatPrice', () => {
    it('formats IDR correctly — no division, no decimals', () => {
        // IDR 150000 → Rp 150.000 (not divided by 100)
        const result = formatPrice(150000, 'IDR');
        const normalized = result.replace(/\s/g, ' ');
        expect(normalized).toMatch(/Rp 150\.000/);
        expect(result).not.toContain(',00');
    });

    it('formats large IDR correctly (millions)', () => {
        // IDR 1500000 → Rp 1.500.000
        const result = formatPrice(1500000, 'IDR');
        expect(result.replace(/\s/g, ' ')).toMatch(/Rp 1\.500\.000/);
    });

    it('formats USD correctly with standard decimals (divides by 100)', () => {
        // USD 15050 minor units → $150.50
        const result = formatPrice(15050, 'USD', 'en-US');
        expect(result).toBe('$150.50');
    });

    it('formats USD zero correctly', () => {
        const result = formatPrice(0, 'USD', 'en-US');
        expect(result).toBe('$0.00');
    });

    it('handles IDR zero values correctly', () => {
        const result = formatPrice(0, 'IDR');
        expect(result.replace(/\s/g, ' ')).toMatch(/Rp 0/);
        expect(result).not.toContain(',00');
    });

    it('handles negative IDR values correctly', () => {
        const result = formatPrice(-150000, 'IDR');
        const normalized = result.replace(/\s/g, ' ');
        expect(normalized).toContain('150.000');
        expect(normalized).toContain('-');
    });

    it('falls back gracefully if Intl.NumberFormat throws', () => {
        const originalFormat = Intl.NumberFormat;

        try {
            // @ts-ignore
            global.Intl.NumberFormat = function () {
                throw new Error("Simulated error");
            };

            // IDR: precision=0, divisor=1, so 150000/1 = 150000, toFixed(0) = "150000"
            const idrResult = formatPrice(150000, 'IDR');
            expect(idrResult).toBe('150000');

            // USD: precision=2, divisor=100, so 15050/100 = 150.5, toFixed(2) = "150.50"
            const usdResult = formatPrice(15050, 'USD');
            expect(usdResult).toBe('150.50');
        } finally {
            global.Intl.NumberFormat = originalFormat;
        }
    });
});
