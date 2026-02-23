/**
 * Tests for the meta tag generation logic of the product page.
 *
 * We test the pure logic that the `meta` function uses, meaning the output
 * structure given different `data` shapes. Because the `meta` export from
 * product.tsx is a plain function that takes `{ data }` and returns an array
 * of tag objects, we can unit-test it directly without spinning up React Router.
 */
import { describe, it, expect } from 'vitest';
import { meta } from '../../routes/product';
import { APP_META_TITLE } from '../../constants';

// --------------------------------------------------------------------------
// Helpers – minimal product shape used in the tests
// --------------------------------------------------------------------------

function makeProduct(overrides: Record<string, any> = {}) {
    return {
        id: 'prod-1',
        name: 'Abaya Nida Premium',
        slug: 'abaya-nida-premium',
        description: '<p>Abaya premium dari bahan <strong>Nida</strong> berkualitas tinggi.</p>',
        featuredAsset: {
            preview: 'https://cdn.example.com/assets/abaya.jpg',
        },
        assets: [],
        variants: [],
        collections: [],
        optionGroups: [],
        facetValues: [],
        ...overrides,
    };
}

// The Route.MetaArgs shape only needs `data` for our function
function makeArgs(data: any) {
    return { data } as any;
}

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

describe('product page meta function', () => {
    it('should return a fallback title when there is no product', () => {
        const tags = meta(makeArgs(null));
        const titleTag = tags.find((t: any) => 'title' in t);
        expect(titleTag?.title).toBe(APP_META_TITLE);
        // Should NOT include OG or twitter tags for an empty product
        expect(tags.find((t: any) => t.property === 'og:image')).toBeUndefined();
    });

    it('should return a fallback title when data is undefined', () => {
        const tags = meta(makeArgs(undefined));
        const titleTag = tags.find((t: any) => 'title' in t);
        expect(titleTag?.title).toBe(APP_META_TITLE);
    });

    it('should include the product name in the title', () => {
        const tags = meta(makeArgs({ product: makeProduct() }));
        const titleTag = tags.find((t: any) => 'title' in t);
        expect(titleTag?.title).toBe(`Abaya Nida Premium - ${APP_META_TITLE}`);
    });

    it('should include a plain-text description without HTML', () => {
        const tags = meta(makeArgs({ product: makeProduct() }));
        const descTag = tags.find((t: any) => t.name === 'description');
        expect(descTag).toBeDefined();
        expect(descTag?.content).not.toContain('<');
        expect(descTag?.content).not.toContain('>');
        expect(descTag?.content).toContain('Abaya premium');
    });

    it('should truncate the description to a maximum of 163 characters (160 + "...")', () => {
        const longDesc = `<p>${'a'.repeat(300)}</p>`;
        const tags = meta(makeArgs({ product: makeProduct({ description: longDesc }) }));
        const descTag = tags.find((t: any) => t.name === 'description');
        expect(descTag?.content.length).toBeLessThanOrEqual(163);
        expect(descTag?.content.endsWith('...')).toBe(true);
    });

    it('should set og:image to the featuredAsset preview URL', () => {
        const tags = meta(makeArgs({ product: makeProduct() }));
        const ogImage = tags.find((t: any) => t.property === 'og:image');
        expect(ogImage?.content).toBe('https://cdn.example.com/assets/abaya.jpg');
    });

    it('should set og:image to empty string when there is no featuredAsset', () => {
        const tags = meta(makeArgs({ product: makeProduct({ featuredAsset: null }) }));
        const ogImage = tags.find((t: any) => t.property === 'og:image');
        expect(ogImage?.content).toBe('');
    });

    it('should include og:title matching the page title', () => {
        const tags = meta(makeArgs({ product: makeProduct() }));
        const ogTitle = tags.find((t: any) => t.property === 'og:title');
        const titleTag = tags.find((t: any) => 'title' in t);
        expect(ogTitle?.content).toBe(titleTag?.title);
    });

    it('should include og:description matching the meta description', () => {
        const tags = meta(makeArgs({ product: makeProduct() }));
        const ogDesc = tags.find((t: any) => t.property === 'og:description');
        const descTag = tags.find((t: any) => t.name === 'description');
        expect(ogDesc?.content).toBe(descTag?.content);
    });

    it('should set og:type to "website"', () => {
        const tags = meta(makeArgs({ product: makeProduct() }));
        const ogType = tags.find((t: any) => t.property === 'og:type');
        expect(ogType?.content).toBe('website');
    });

    it('should set og:site_name to the app title constant', () => {
        const tags = meta(makeArgs({ product: makeProduct() }));
        const ogSiteName = tags.find((t: any) => t.property === 'og:site_name');
        expect(ogSiteName?.content).toBe(APP_META_TITLE);
    });

    it('should include twitter:card set to summary_large_image', () => {
        const tags = meta(makeArgs({ product: makeProduct() }));
        const twitterCard = tags.find((t: any) => t.name === 'twitter:card');
        expect(twitterCard?.content).toBe('summary_large_image');
    });

    it('should have twitter:image matching og:image', () => {
        const tags = meta(makeArgs({ product: makeProduct() }));
        const twitterImage = tags.find((t: any) => t.name === 'twitter:image');
        const ogImage = tags.find((t: any) => t.property === 'og:image');
        expect(twitterImage?.content).toBe(ogImage?.content);
    });

    it('should have twitter:title and twitter:description matching OG equivalents', () => {
        const tags = meta(makeArgs({ product: makeProduct() }));
        const twitterTitle = tags.find((t: any) => t.name === 'twitter:title');
        const twitterDesc = tags.find((t: any) => t.name === 'twitter:description');
        const ogTitle = tags.find((t: any) => t.property === 'og:title');
        const ogDesc = tags.find((t: any) => t.property === 'og:description');
        expect(twitterTitle?.content).toBe(ogTitle?.content);
        expect(twitterDesc?.content).toBe(ogDesc?.content);
    });

    it('should return exactly 11 tag objects for a valid product', () => {
        const tags = meta(makeArgs({ product: makeProduct() }));
        // title, description, og:title, og:description, og:image, og:type,
        // og:site_name, twitter:card, twitter:title, twitter:description, twitter:image
        expect(tags).toHaveLength(11);
    });
});
