import type { Route } from "./+types/product";
import {
    data,
    useOutletContext,
} from "react-router";
import { useState, useEffect } from "react";
import type { FetcherWithComponents } from "react-router";
import { Price } from "../components/products/Price";
import { getProductBySlug } from "../providers/products/products";
import { getActiveCustomerWishlist } from "../providers/wishlist/wishlist";
import { getProductReviews } from "../providers/reviews/reviews";
import { getActiveCustomer, getActiveCustomerOrderList } from "../providers/customer/customer";
import { search } from "../providers/products/products";
import { Check } from "lucide-react";

import { APP_META_TITLE } from "../constants";
import { type CartLoaderData } from "./api/active-order";
import { getSession, commitSession } from "../sessions";
import { ErrorCode, type ErrorResult } from "../generated/graphql";
import Alert from "../components/Alert";
import { StockLevelLabel } from "../components/products/StockLevelLabel";
import TopReviews from "../components/products/TopReviews";
import ReviewForm from "../components/products/ReviewForm";

import { WishlistButton } from "../components/wishlist/WishlistButton";
import { RelatedProducts } from "../components/products/RelatedProducts";
import { StarRating } from "../components/products/StarRating";
import { ImageGallery, type Asset } from "../components/products/ImageGallery";
import { ProductOptionSelector, type OptionGroup } from "../components/products/ProductOptionSelector";

export const meta = ({ data }: Route.MetaArgs) => {
    return [
        {
            title: data?.product?.name
                ? `${data.product.name} - ${APP_META_TITLE}`
                : APP_META_TITLE,
        },
    ];
};

export async function loader({ params, request, context }: Route.LoaderArgs) {
    const kv = context.cloudflare.env.KV_CACHE;
    const options = { request, kv };
    const { product } = await getProductBySlug(params.slug, options);
    if (!product) {
        throw data("Not Found", {
            status: 404,
        });
    }
    const session = await getSession(request.headers.get("Cookie"));
    const error = session.get("activeOrderError");

    let wishlistItemsMap: Record<string, string> = {};
    let isLoggedIn = false;
    try {
        const wishlist = await getActiveCustomerWishlist(options);
        if (wishlist?.activeCustomerWishlist) {
            wishlist.activeCustomerWishlist.forEach((item: any) => {
                wishlistItemsMap[item.productVariant.id] = item.id;
            });
            isLoggedIn = true;
        }
    } catch {
        // User not logged in
    }

    let activeCustomer: any = null;
    if (isLoggedIn) {
        try {
            const customer = await getActiveCustomer(options);
            activeCustomer = customer?.activeCustomer;
        } catch {
            // Not logged in
        }
    }

    let hasPurchased = false;
    if (isLoggedIn) {
        try {
            const orders = await getActiveCustomerOrderList(
                { take: 100 },
                options
            );

            if (orders?.activeCustomer?.orders?.items) {
                hasPurchased = orders.activeCustomer.orders.items.some((order: any) =>
                    order.lines.some((line: any) => line.productVariant.product.slug === params.slug)
                );
            }
        } catch (e) {
            console.error("Failed to fetch customer orders:", e);
        }
    }

    let reviews: any[] = [];
    try {
        const reviewsData = await getProductReviews(product.id, options);
        reviews = reviewsData?.items || [];
    } catch (e) {
        console.error("Failed to fetch reviews:", e);
    }


    let relatedProducts: any[] = [];
    if (product.collections.length > 0) {
        try {
            const collectionSlug = product.collections[0].slug;
            const searchResult = await search({
                input: {
                    collectionSlug,
                    take: 10,
                }
            }, options);

            relatedProducts = searchResult.search.items.filter((item: any) => item.productId !== product.id);
        } catch (e) {
            console.error("Failed to fetch related products:", e);
        }
    }

    return data(
        { product: product!, error, wishlistItemsMap, reviews, isLoggedIn, hasPurchased, relatedProducts, activeCustomer },
        {
            headers: {
                "Set-Cookie": await commitSession(session),
            },
        }
    );
}


export default function ProductSlug({ loaderData }: Route.ComponentProps) {
    const { product, error, wishlistItemsMap, reviews, isLoggedIn, hasPurchased, relatedProducts, activeCustomer } = loaderData;
    const { activeOrderFetcher } = useOutletContext<{
        activeOrderFetcher: FetcherWithComponents<CartLoaderData>;
    }>();
    const { activeOrder, error: fetcherError } = activeOrderFetcher.data ?? {};
    const addItemToOrderError = getAddItemToOrderError(fetcherError || error);


    if (!product) {
        return <div className="pt-40 text-center">Product not found</div>;
    }

    const [selectedVariantId, setSelectedVariantId] = useState(
        product.variants[0]?.id
    );
    const selectedVariant = product.variants.find((v: any) => v.id === selectedVariantId);

    // Initialize options
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

    useEffect(() => {
        if (product.variants.length > 0 && Object.keys(selectedOptions).length === 0) {
            const initialVariant = product.variants[0];
            const initialOptions: Record<string, string> = {};
            initialVariant.options?.forEach((opt: any) => {
                initialOptions[opt.group.id] = opt.id;
            });
            setSelectedOptions(initialOptions);
        }
    }, [product.variants]);

    // Compute option groups with unique options from variants
    const optionGroups = product.optionGroups?.map((group: any) => {
        const groupOptions = new Map();
        product.variants.forEach((variant: any) => {
            variant.options?.forEach((opt: any) => {
                if (opt.group.id === group.id) {
                    groupOptions.set(opt.id, opt);
                }
            });
        });
        return {
            ...group,
            options: Array.from(groupOptions.values())
        };
    }) as OptionGroup[] || [];

    const averageRating = reviews.length > 0
        ? reviews.reduce((acc: any, r: any) => acc + r.rating, 0) / reviews.length
        : 0;

    const [isRelatedTransitioning, setIsRelatedTransitioning] = useState(false);

    useEffect(() => {
        setIsRelatedTransitioning(false);
    }, [product.id]);

    useEffect(() => {
        if (!selectedVariant && product.variants.length > 0) {
            setSelectedVariantId(product.variants[0].id);
            // Also reset options if variant changes externally (rare but possible)
            const initialVariant = product.variants[0];
            const initialOptions: Record<string, string> = {};
            initialVariant.options?.forEach((opt: any) => {
                initialOptions[opt.group.id] = opt.id;
            });
            setSelectedOptions(initialOptions);
        }
    }, [product.variants, selectedVariant]);

    const qtyInCart =
        activeOrder?.lines.find((l: any) => l.productVariant.id === selectedVariantId)
            ?.quantity ?? 0;

    const brandName = product.facetValues.find(
        (fv: any) => fv.facet.code === "brand"
    )?.name;

    const [featuredAsset, setFeaturedAsset] = useState(
        selectedVariant?.featuredAsset || product.featuredAsset
    );

    useEffect(() => {
        setFeaturedAsset(selectedVariant?.featuredAsset || product.featuredAsset);
    }, [product, selectedVariant]);

    // Ensure assets are valid
    const validAssets = product.assets.filter((a: any) => a != null);

    const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);

    return (
        <div className="bg-white min-h-screen pt-20 lg:pt-50 animate-fade-in">
            <div className="container mx-auto px-6 max-w-7xl">


                <div className="lg:grid lg:grid-cols-12 lg:gap-24 items-start">
                    <div className="lg:col-span-7 space-y-8 relative">
                        <ImageGallery
                            images={validAssets as Asset[]}
                            selectedImage={(featuredAsset || product.featuredAsset || validAssets[0]) ?? undefined}
                            onSelectImage={setFeaturedAsset}
                            isTransitioning={isRelatedTransitioning}
                        />
                        <div className="absolute top-4 right-4 z-10">
                            <WishlistButton
                                productVariantId={selectedVariantId}
                                wishlistItemId={wishlistItemsMap[selectedVariantId]}
                                isInWishlist={!!wishlistItemsMap[selectedVariantId]}
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-5 lg:sticky lg:top-40 mt-16 lg:mt-0">
                        <div className="space-y-10">
                            <div className="space-y-4">
                                <span className="text-[10px] uppercase tracking-[0.4em] text-karima-accent font-medium">
                                    {brandName || "Atelier Collection"}
                                </span>
                                <h1
                                    className="text-4xl md:text-5xl lg:text-6xl font-serif text-karima-brand italic leading-tight tracking-tight"
                                    style={{ viewTransitionName: "product-title" }}
                                >
                                    {product.name}
                                </h1>
                                <div className="flex items-center gap-6 pt-2">
                                    <div className="text-xl font-sans font-light tracking-widest text-karima-brand">
                                        <Price
                                            priceWithTax={selectedVariant?.priceWithTax}
                                            currencyCode={selectedVariant?.currencyCode}
                                        />
                                    </div>
                                </div>
                            </div>



                            <div className="w-full h-[1px] bg-karima-brand/5"></div>

                            <div className="space-y-10">
                                {optionGroups.length > 0 ? (
                                    <ProductOptionSelector
                                        optionGroups={optionGroups}
                                        selectedOptions={selectedOptions}
                                        onChange={(groupId, optionId) => {
                                            const newOptions = { ...selectedOptions, [groupId]: optionId };
                                            setSelectedOptions(newOptions);

                                            // Find matching variant
                                            const variant = product.variants.find((v: any) =>
                                                v.options.every((opt: any) => newOptions[opt.group.id] === opt.id)
                                            );

                                            if (variant) {
                                                setSelectedVariantId(variant.id);
                                            }
                                        }}
                                        isOptionAvailable={(groupId, optionId) => {
                                            // Check if there is any variant that matches this option 
                                            // AND the other currently selected options
                                            // AND is IN STOCK
                                            const potentialOptions = { ...selectedOptions, [groupId]: optionId };
                                            return product.variants.some((v: any) =>
                                                v.options.every((opt: any) => {
                                                    // Only check relevance against other groups
                                                    if (opt.group.id === groupId) return opt.id === optionId;
                                                    return potentialOptions[opt.group.id] ? potentialOptions[opt.group.id] === opt.id : true;
                                                }) && v.stockLevel !== 'OUT_OF_STOCK'
                                            );
                                        }}
                                    />
                                ) : product.variants.length > 1 && (
                                    // Fallback for flat variants if no OptionGroups defined
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-end">
                                            <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-karima-brand">
                                                Select Option
                                            </label>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {product.variants.map((variant: any) => {
                                                const isAvailable = variant.stockLevel !== 'OUT_OF_STOCK';
                                                return (
                                                    <button
                                                        key={variant.id}
                                                        type="button"
                                                        disabled={!isAvailable}
                                                        onClick={() => {
                                                            setSelectedVariantId(variant.id);
                                                            setFeaturedAsset(variant.featuredAsset);
                                                        }}
                                                        className={`
                                                            relative py-4 text-[10px] uppercase tracking-[0.2em] border transition-all duration-500 overflow-hidden
                                                            ${selectedVariantId === variant.id
                                                                ? isAvailable
                                                                    ? "bg-karima-brand text-white border-karima-brand"
                                                                    : "bg-stone-200 text-stone-400 border-stone-400 cursor-not-allowed"
                                                                : isAvailable
                                                                    ? "bg-transparent border-karima-brand/10 text-karima-ink hover:border-karima-brand/40"
                                                                    : "bg-stone-200 border-stone-200 text-stone-400 cursor-not-allowed"
                                                            }`}
                                                    >
                                                        <span className={!isAvailable ? "opacity-30" : ""}>{variant.name}</span>
                                                        {!isAvailable && (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <div className="w-full h-[1px] bg-stone-400/50 -rotate-45 transform scale-x-110"></div>
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="fixed bottom-0 left-0 right-0 z-50 bg-white px-4 lg:static lg:bg-transparent lg:shadow-none lg:border-none lg:px-0">
                                    <activeOrderFetcher.Form
                                        method="post"
                                        action="/api/active-order"
                                    >
                                        <input type="hidden" name="action" value="addItemToOrder" />
                                        <input type="hidden" name="variantId" value={selectedVariantId} />
                                        <button
                                            type="submit"
                                            disabled={activeOrderFetcher.state !== "idle" || !selectedVariantId || selectedVariant?.stockLevel === 'OUT_OF_STOCK'}
                                            className={`w-full h-16 text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-700 relative overflow-hidden group rounded-sm ${selectedVariant?.stockLevel === 'OUT_OF_STOCK'
                                                ? "bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-200"
                                                : qtyInCart > 0
                                                    ? "bg-stone-800 text-white"
                                                    : "bg-black text-white hover:bg-karima-brand"
                                                }`}
                                        >
                                            <span className="relative z-10 flex items-center justify-center gap-3">
                                                {activeOrderFetcher.state !== "idle" ? (
                                                    <span className="animate-pulse">Updating...</span>
                                                ) : selectedVariant?.stockLevel === 'OUT_OF_STOCK' ? (
                                                    "SOLD OUT"
                                                ) : qtyInCart > 0 ? (
                                                    <>
                                                        <Check size={14} />
                                                        {qtyInCart} in cart
                                                    </>
                                                ) : (
                                                    "Add to Cart"
                                                )}
                                            </span>
                                        </button>
                                    </activeOrderFetcher.Form>
                                </div>

                            </div>

                            {addItemToOrderError && (
                                <Alert message={addItemToOrderError} />
                            )}

                            <div className="space-y-8 pt-6">
                                <div className="space-y-4">
                                    <button
                                        onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                                        className="w-full flex justify-between items-center group cursor-pointer"
                                    >
                                        <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-karima-brand">Description</h4>
                                        <div className={`transition-transform duration-500 ${isDescriptionOpen ? 'rotate-180' : ''}`}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-karima-brand/40 group-hover:text-karima-brand transition-colors">
                                                <polyline points="6 9 12 15 18 9"></polyline>
                                            </svg>
                                        </div>
                                    </button>

                                    <div className={`overflow-hidden transition-all duration-700 ease-in-out ${isDescriptionOpen ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                                        <div
                                            className="text-sm text-karima-ink/60 font-light leading-relaxed prose prose-stone max-w-none"
                                            dangerouslySetInnerHTML={{
                                                __html: product.description,
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="w-full h-[1px] bg-karima-brand/5"></div>
                                <div className="space-y-4">
                                    <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-karima-brand">Shipping & Returns</h4>
                                    <p className="text-[11px] text-karima-ink/40 leading-loose tracking-widest uppercase">
                                        Free shipping on orders over Rp 2.000.000. <br />
                                        14-day return policy for unworn items.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <RelatedProducts
                products={relatedProducts}
                onTransition={() => setIsRelatedTransitioning(true)}
            />

            <section className="bg-white">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="">
                        <TopReviews reviews={reviews} canReview={isLoggedIn && hasPurchased} productName={product.name} />
                    </div>
                    <ReviewForm
                        productId={product.id}
                        productSlug={product.slug}
                        isLoggedIn={isLoggedIn}
                        hasPurchased={hasPurchased}
                        activeCustomer={activeCustomer}
                        reviews={reviews}
                    />
                </div>
            </section>

        </div>
    );
}

export function ErrorBoundary() {
    return (
        <div className="max-w-6xl mx-auto px-4 py-40 text-center">
            <h2 className="text-3xl font-light">Product not found</h2>
        </div>
    );
}

function getAddItemToOrderError(error?: ErrorResult): string | undefined {
    if (!error || !error.errorCode) return undefined;
    switch (error.errorCode) {
        case ErrorCode.OrderModificationError:
        case ErrorCode.OrderLimitError:
        case ErrorCode.NegativeQuantityError:
        case ErrorCode.InsufficientStockError:
            return error.message;
        default:
            return undefined;
    }
}
