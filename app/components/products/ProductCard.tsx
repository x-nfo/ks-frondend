import { Link, useViewTransitionState } from "react-router";
import type { SearchQuery } from "../../generated/graphql";
import { Price } from "./Price";
import { useMemo, useState } from "react";
import { sdk } from "../../utils/graphqlWrapper";
import { WishlistButton } from "../wishlist/WishlistButton";

export type ProductCardProps = SearchQuery["search"]["items"][number] & {
    category?: string;
    colors?: string[];
    productVariantId: string;
};

export function ProductCard({
    productAsset,
    productVariantAsset,
    productName,
    slug,
    priceWithTax,
    currencyCode,
    category,
    colors,
    productVariantId,
}: ProductCardProps) {
    const to = `/products/${slug}`;
    // @ts-ignore
    const isTransitioning = useViewTransitionState(to);

    const [extraAssets, setExtraAssets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleMouseEnter = async () => {
        if (extraAssets.length > 0 || isLoading) return;

        setIsLoading(true);
        try {
            console.log(`[ProductCard] Prefetching lightweight asset metadata for ${slug}...`);
            const baseUrl = typeof window !== "undefined" && (window as any).ENV?.VENDURE_API_URL
                ? (window as any).ENV.VENDURE_API_URL
                : "http://localhost:3000/shop-api";

            const response = await fetch(baseUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: `
                        query GetProductAssets($slug: String!) {
                            product(slug: $slug) {
                                assets {
                                    id
                                    preview
                                }
                            }
                        }
                    `,
                    variables: { slug },
                }),
            });

            const result = await response.json();
            const assets = result.data?.product?.assets;

            if (assets && assets.length > 0) {
                console.log(`[ProductCard] Prefetched metadata for ${assets.length} assets of ${slug} (Success)`);
                setExtraAssets(assets);
            } else {
                console.warn(`[ProductCard] No assets available for ${slug}`);
                setExtraAssets([{ id: 'no-assets' }]);
            }
        } catch (error) {
            console.error("[ProductCard] Lightweight prefetch failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const secondaryAsset = useMemo(() => {
        // 1. First priority: 2nd asset from fetched product gallery (as requested by user)
        if (extraAssets.length > 1) {
            const gallerySecond = extraAssets.find((a: any) => a.id !== productAsset?.id && a.id !== 'no-assets') || extraAssets[1];
            if (gallerySecond?.preview) return gallerySecond;
        }

        // 2. Second priority: Variant asset (if different from main)
        if (productVariantAsset?.id && productVariantAsset.id !== productAsset?.id) {
            if (productVariantAsset.preview) return productVariantAsset;
        }

        return null;
    }, [productAsset, productVariantAsset, extraAssets]);

    const secondarySrc = useMemo(() => {
        if (!secondaryAsset?.preview) return null;
        const base = secondaryAsset.preview;
        const separator = base.includes('?') ? '&' : '?';
        return `${base}${separator}w=600&h=800&fit=crop`;
    }, [secondaryAsset]);

    return (
        <Link
            className={`group relative cursor-pointer block h-full ${isTransitioning ? "transitioning" : ""}`}
            to={to}
            onMouseEnter={handleMouseEnter}
            prefetch="intent"
            viewTransition
        >
            {/* Image Container with Aspect Ratio */}
            <div className="relative w-full overflow-hidden bg-stone-100 aspect-[2/3] mb-8 transition-all duration-[2000ms] ease-out group-hover:shadow-2xl group-hover:shadow-karima-brand/5">
                {/* Wishlist Button */}
                <div className="absolute top-3 right-3 z-30 opacity-100 transition-opacity duration-500">
                    <WishlistButton
                        productVariantId={productVariantId}
                        className="!w-9 !h-9 bg-white text-karima-brand border border-white/40 !shadow-none backdrop-blur-sm"
                    />
                </div>

                {/* Main Image */}
                <img
                    className="absolute inset-0 w-full h-full object-cover object-top transition-all duration-[2000ms] ease-out group-hover:scale-105"
                    alt={productName}
                    src={productAsset?.preview
                        ? (productAsset.preview + (productAsset.preview.includes('?') ? '&' : '?') + "w=600&h=800&fit=crop")
                        : "https://images.unsplash.com/photo-1596451190630-186aff535bf2?q=80&w=600&auto=format&fit=crop"
                    }
                    loading="lazy"
                />

                {/* Hover Image (Secondary Asset) */}
                {secondarySrc && (
                    <img
                        className="absolute inset-0 w-full h-full object-cover object-top opacity-0 transition-opacity duration-[2000ms] ease-out group-hover:opacity-100 group-hover:scale-105"
                        alt={`${productName} - Alternate View`}
                        src={secondarySrc}
                        loading="lazy"
                    />
                )}

                {/* Quick View Overlay */}
                <div className="absolute inset-0 bg-black/5 transition-opacity duration-[2000ms] opacity-0 group-hover:opacity-100 pointer-events-none">
                    <div className="absolute bottom-6 left-0 w-full text-center pointer-events-auto">
                        <span className="inline-block border border-white/80 text-white px-8 py-3 text-[10px] uppercase tracking-[0.25em] backdrop-blur-sm hover:bg-white hover:text-karima-brand transition-all duration-500">
                            Quick View
                        </span>
                    </div>
                </div>
            </div>

            {/* Product Info - Clean & Centered */}
            <div className="flex flex-col items-center text-center gap-1">
                {/* Category */}
                <p className="text-[9px] uppercase tracking-widest text-karima-ink/40 mb-1">
                    {category || "Collection"}
                </p>

                {/* Name */}
                <h3 className="font-serif not-italic text-sm md:text-2xl text-karima-brand leading-none group-hover:text-karima-gold transition-colors duration-500">
                    {productName}
                </h3>

                {/* Price */}
                <div className="text-xs font-medium text-karima-ink/80 pt-1">
                    <Price priceWithTax={priceWithTax} currencyCode={currencyCode} />
                </div>

                {/* Color swatches preview - Fade in on hover */}
                {colors && colors.length > 0 && (
                    <div className="flex gap-2 pt-4 transition-all duration-[2000ms] opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
                        {colors.slice(0, 4).map((color, idx) => (
                            <div
                                key={`${color}-${idx}`}
                                className="w-2 h-2 rounded-full border border-stone-200"
                                style={{ backgroundColor: color }}
                            ></div>
                        ))}
                        {colors.length > 4 && (
                            <span className="text-[8px] text-gray-400 mt-0.5">+{colors.length - 4}</span>
                        )}
                    </div>
                )}
            </div>
        </Link>
    );
}
