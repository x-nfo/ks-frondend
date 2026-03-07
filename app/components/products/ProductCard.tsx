import { Link } from "react-router";
import type { SearchQuery } from "../../generated/graphql";
import { Price } from "./Price";
import { useMemo, useState } from "react";
import { sdk } from "../../utils/graphqlWrapper";
import { WishlistButton } from "../wishlist/WishlistButton";
import { COLOR_MAP } from "../../constants";

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
  colors: initialColors,
  productVariantId,
}: ProductCardProps) {
  const to = `/products/${slug}`;

  const [extraAssets, setExtraAssets] = useState<any[]>([]);
  const [fetchedColors, setFetchedColors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Use fetchedColors if available (from hover prefetch), else fall back to initialColors passed down
  const colors = fetchedColors.length > 0 ? fetchedColors : initialColors;

  const handleMouseEnter = async () => {
    setIsHovered(true);
    if (extraAssets.length > 0 || isLoading) return;

    setIsLoading(true);
    try {
      console.log(
        `[ProductCard] Prefetching lightweight asset metadata for ${slug}...`,
      );
      const baseUrl =
        typeof window !== "undefined" && (window as any).ENV?.VENDURE_API_URL
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
                                optionGroups {
                                    code
                                    name
                                    options {
                                        code
                                        name
                                    }
                                }
                            }
                        }
                    `,
          variables: { slug },
        }),
      });

      const result = (await response.json()) as any;
      const assets = result.data?.product?.assets;
      const optionGroups = result.data?.product?.optionGroups || [];

      // Extract colors from OptionGroups
      const colorGroup = optionGroups.find(
        (og: any) =>
          og.code?.toLowerCase() === "color" ||
          og.code?.toLowerCase() === "warna" ||
          og.name?.toLowerCase() === "color" ||
          og.name?.toLowerCase() === "warna"
      );

      if (colorGroup && colorGroup.options) {
        const hexes = new Set<string>();
        colorGroup.options.forEach((opt: any) => {
          const nameLower = opt.name?.toLowerCase() || "";
          let foundHex = false;

          // 1. First prioritize if the option "code" is directly an explicit #HEX code
          if (opt.code && opt.code.startsWith("#")) {
            hexes.add(opt.code);
            foundHex = true;
          }

          // 2. Fallback to mapping by name if code wasn't a hex format
          if (!foundHex) {
            if (COLOR_MAP[nameLower]) {
              hexes.add(COLOR_MAP[nameLower]);
              foundHex = true;
            } else {
              for (const [key, hex] of Object.entries(COLOR_MAP)) {
                if (nameLower.includes(key)) {
                  hexes.add(hex);
                  foundHex = true;
                }
              }
            }
          }
        });

        if (hexes.size > 0) {
          setFetchedColors(Array.from(hexes));
        }
      }

      if (assets && assets.length > 0) {
        console.log(
          `[ProductCard] Prefetched metadata for ${assets.length} assets of ${slug} (Success)`,
        );
        setExtraAssets(assets);
      } else {
        console.warn(`[ProductCard] No assets available for ${slug}`);
        setExtraAssets([{ id: "no-assets" }]);
      }
    } catch (error) {
      console.error("[ProductCard] Lightweight prefetch failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const secondaryAsset = useMemo(() => {
    // 1. First priority: 2nd asset from fetched product gallery (as requested by user)
    if (extraAssets.length > 1) {
      const gallerySecond =
        extraAssets.find(
          (a: any) => a.id !== productAsset?.id && a.id !== "no-assets",
        ) || extraAssets[1];
      if (gallerySecond?.preview) return gallerySecond;
    }

    // 2. Second priority: Variant asset (if different from main)
    if (
      productVariantAsset?.id &&
      productVariantAsset.id !== productAsset?.id
    ) {
      if (productVariantAsset.preview) return productVariantAsset;
    }

    return null;
  }, [productAsset, productVariantAsset, extraAssets]);

  const secondarySrc = useMemo(() => {
    if (!secondaryAsset?.preview) return null;
    const base = secondaryAsset.preview;
    const separator = base.includes("?") ? "&" : "?";
    return `${base}${separator}w=600&h=800&fit=crop`;
  }, [secondaryAsset]);

  return (
    <Link
      className="group relative cursor-pointer block h-full w-full"
      to={to}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      prefetch="intent"
    >
      {/* Image Container with Aspect Ratio */}
      <div className="relative w-full overflow-hidden bg-stone-100 aspect-[2/3] mb-3 md:mb-8 transition-all duration-600 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:shadow-2xl group-hover:shadow-karima-brand/5">
        {/* Wishlist Button */}
        <div className="absolute top-3 right-3 z-30 opacity-100">
          <WishlistButton
            productVariantId={productVariantId}
            className="!w-9 !h-9 bg-white text-karima-brand border border-white/40 !shadow-none backdrop-blur-sm"
          />
        </div>

        {/* Main Image */}
        <img
          className="absolute inset-0 w-full h-full object-cover object-top text-transparent opacity-100 scale-100 transition-all duration-[2000ms] ease-out group-hover:opacity-0 group-hover:scale-105"
          alt={productName}
          src={
            productAsset?.preview
              ? productAsset.preview +
              (productAsset.preview.includes("?") ? "&" : "?") +
              "w=600&h=800&fit=crop"
              : "https://images.unsplash.com/photo-1596451190630-186aff535bf2?q=80&w=600&auto=format&fit=crop"
          }
          loading="lazy"
        />

        {/* Hover Image (Secondary Asset) */}
        {secondarySrc && (
          <img
            className="absolute inset-0 w-full h-full object-cover object-top opacity-0 scale-110 transition-all duration-[2000ms] ease-out group-hover:opacity-100 group-hover:scale-105"
            alt={`${productName} - Alternate View`}
            src={secondarySrc}
            loading="lazy"
          />
        )}

        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-black/5 transition-opacity duration-600 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] opacity-0 group-hover:opacity-100 pointer-events-none">
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

        {/* Color Preview Dots - Fade in on hover (like karima-example) */}
        {colors && colors.length > 0 && (
          <div
            className={`h-4 mt-2 mb-1 flex gap-2 items-center justify-center transition-all duration-700 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}
          >
            {colors.slice(0, 6).map((color, idx) => (
              <div
                key={`${color}-${idx}`}
                className="w-2 h-2 rounded-full border border-stone-300 shadow-sm transition-transform hover:scale-110 cursor-pointer"
                style={{ backgroundColor: color }}
              />
            ))}
            {colors.length > 6 && (
              <span className="text-xxs text-gray-500 font-medium ml-1">
                +{colors.length - 6}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

