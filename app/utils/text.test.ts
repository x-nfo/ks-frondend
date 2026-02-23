import { describe, it, expect } from 'vitest';
import { stripHtml, truncate } from './text';

describe('stripHtml', () => {
    it('should remove simple HTML tags', () => {
        expect(stripHtml('<p>Hello World</p>')).toBe('Hello World');
    });

    it('should remove nested HTML tags', () => {
        expect(stripHtml('<p><strong>Bold</strong> and <em>italic</em> text</p>')).toBe(
            'Bold and italic text'
        );
    });

    it('should handle self-closing tags', () => {
        expect(stripHtml('Line one<br/>Line two')).toBe('Line oneLine two');
    });

    it('should handle HTML with attributes', () => {
        expect(stripHtml('<a href="https://example.com" class="link">Click here</a>')).toBe(
            'Click here'
        );
    });

    it('should return plain text unchanged', () => {
        expect(stripHtml('No HTML here')).toBe('No HTML here');
    });

    it('should return an empty string from empty input', () => {
        expect(stripHtml('')).toBe('');
    });

    it('should trim leading and trailing whitespace', () => {
        expect(stripHtml('  <p>Padded</p>  ')).toBe('Padded');
    });

    it('should handle a real product description style input', () => {
        const html =
            '<p>Abaya premium dari bahan <strong>Nida</strong> dengan kualitas terbaik.</p><ul><li>Ukuran All Size</li><li>Warna: Hitam, Navy</li></ul>';
        const result = stripHtml(html);
        expect(result).toBe(
            'Abaya premium dari bahan Nida dengan kualitas terbaik.Ukuran All SizeWarna: Hitam, Navy'
        );
        expect(result).not.toContain('<');
        expect(result).not.toContain('>');
    });
});

describe('truncate', () => {
    it('should not truncate a string shorter than the limit', () => {
        expect(truncate('Short text', 160)).toBe('Short text');
    });

    it('should not truncate a string exactly at the limit', () => {
        const text = 'a'.repeat(160);
        expect(truncate(text, 160)).toBe(text);
    });

    it('should truncate a string longer than the limit and append ellipsis', () => {
        const text = 'a'.repeat(200);
        const result = truncate(text, 160);
        expect(result).toBe('a'.repeat(160) + '...');
        expect(result.length).toBe(163); // 160 chars + "..."
    });

    it('should truncate to 160 chars from a typical description', () => {
        const longDescription =
            'Karima menghadirkan koleksi busana muslim syar\'i premium yang memadukan kesantunan dan keanggunan modern. Tersedia dalam berbagai pilihan warna dan ukuran eksklusif.';
        const result = truncate(longDescription, 160);
        // The description is 165 chars, should be truncated
        expect(result.endsWith('...')).toBe(true);
        expect(result.length).toBeLessThanOrEqual(163);
    });

    it('should handle an empty string', () => {
        expect(truncate('', 160)).toBe('');
    });
});
