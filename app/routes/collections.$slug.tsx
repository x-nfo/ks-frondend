import type { Route } from "./+types/collections.$slug";
import { getCollection } from "../providers/collections/collections";
import { search } from "../providers/products/products";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router";
import { Filter, LayoutGrid, Grid3x3 } from "lucide-react";

import { CollectionCard } from "../components/collections/CollectionCard";
import { ProductCard } from "../components/products/ProductCard";
import { APP_META_TITLE } from "../constants";
import {
  FilterSidebar,
  type Filters,
} from "../components/collections/FilterSidebar";

export async function loader({ params, request, context }: Route.LoaderArgs) {
  const { slug } = params;
  const kv = context.cloudflare.env.KV_CACHE;
  const apiUrl =
    (context.cloudflare.env as any).VENDURE_API_URL ||
    process.env.VENDURE_API_URL ||
    "http://localhost:3000/shop-api";
  const options = { request, apiUrl };
  const publicOptions = { ...options, kv };

  if (!slug) {
    throw new Response("Not Found", { status: 404 });
  }

  let collection;
  let searchInput: any = {
    groupByProduct: true,
    take: 100,
  };

  if (slug === "all") {
    collection = {
      id: "all",
      name: "All Products",
      children: [],
      breadcrumbs: [
        { id: "all", name: "Home", slug: "" },
        { id: "all-products", name: "All Products", slug: "all" },
      ],
    };
  } else {
    collection = await getCollection(slug, publicOptions);
    if (!collection?.id || !collection?.name) {
      throw new Response("Not Found", { status: 404 });
    }
    searchInput.collectionSlug = slug;
  }

  // Fetch products
  const searchResult = await search(
    {
      input: searchInput,
    },
    publicOptions,
  );

  return {
    collection,
    products: searchResult.search.items,
    totalProducts: searchResult.search.totalItems,
    facets: searchResult.search.facetValues,
  };
}

export function meta({ data }: Route.MetaArgs) {
  return [
    {
      title: data?.collection
        ? `${data.collection.name} - ${APP_META_TITLE}`
        : APP_META_TITLE,
    },
  ];
}

const COLOR_MAP: Record<string, string> = {
  black: "#000000",
  navy: "#373557",
  choco: "#a68483",
  almond: "#dbc5ba",
  wood: "#e4cacd",
  terracotta: "#99432f",
  "dusty pink": "#c97f86",
  olive: "#635c4a",
  moss: "#988076",
  sage: "#cfb59d",
  tosca: "#a3a2a0",
  jeans: "#6c84b8",
  blue: "#86a6cf",
  "light blue": "#d3e3f5",
  plum: "#786167",
  ruby: "#704052",
};

function getProductColorHexes(item: any, facetLookup: Map<string, any>) {
  const productFacets =
    item.facetValueIds
      ?.map((id: string) => facetLookup.get(id))
      .filter(Boolean) || [];
  const colorFacets = productFacets.filter(
    (f: any) =>
      ["color", "colour", "warna"].includes(f.facetCode?.toLowerCase()) ||
      ["color", "colour", "warna"].includes(f.facetName?.toLowerCase()),
  );

  const hexes = new Set<string>();

  // 1. From Facets
  colorFacets.forEach((f: any) => {
    const name = f.name.toLowerCase();
    for (const [key, hex] of Object.entries(COLOR_MAP)) {
      if (name.includes(key)) hexes.add(hex);
    }
  });

  // 2. Fallback to Product Name if no hexes found from facets
  if (hexes.size === 0 && item.productName) {
    const nameLower = item.productName.toLowerCase();
    for (const [key, hex] of Object.entries(COLOR_MAP)) {
      if (nameLower.includes(key)) hexes.add(hex);
    }
  }

  return Array.from(hexes);
}

export default function CollectionSlug({ loaderData }: Route.ComponentProps) {
  const { collection, products: initialProducts, facets } = loaderData;
  const [searchParams] = useSearchParams();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [gridCols, setGridCols] = useState(3);
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc">(
    "newest",
  );

  const [filters, setFilters] = useState<Filters>({
    category: [],
    colors: [],
    minPrice: 0,
    maxPrice: 100000000, // Set to a high default
  });

  // Sync filters with URL search params
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    setFilters((prev) => ({
      ...prev,
      category: categoryParam ? [categoryParam] : [],
    }));
  }, [searchParams]);

  // Create a lookup map for FacetValue ID -> FacetValue Details
  const facetLookup = useMemo(() => {
    const map = new Map<
      string,
      { name: string; code: string; facetName: string; facetCode: string }
    >();
    facets?.forEach((f: any) => {
      if (f.facetValue?.id) {
        map.set(f.facetValue.id, {
          name: f.facetValue.name,
          code: f.facetValue.code,
          facetName: f.facetValue.facet?.name,
          facetCode: f.facetValue.facet?.code,
        });
      }
    });
    return map;
  }, [facets]);

  const activeFiltersCount = filters.category.length + filters.colors.length;

  // Derived dynamic filters from backend facets
  const availableCategories = useMemo(() => {
    const categories =
      facets
        ?.filter(
          (f: any) =>
            f.facetValue?.facet?.code?.toLowerCase() === "category" ||
            f.facetValue?.facet?.name?.toLowerCase() === "category",
        )
        .map((f: any) => f.facetValue?.name)
        .filter(Boolean) || [];
    return Array.from(new Set(categories)).sort();
  }, [facets]);

  const availableColors = useMemo(() => {
    const colorFacets =
      facets?.filter(
        (f: any) =>
          ["color", "colour", "warna"].includes(
            f.facetValue?.facet?.code?.toLowerCase(),
          ) ||
          ["color", "colour", "warna"].includes(
            f.facetValue?.facet?.name?.toLowerCase(),
          ),
      ) || [];

    const colorsMap = new Map<string, string>();
    colorFacets.forEach((f: any) => {
      const name = f.facetValue?.name?.toLowerCase();
      if (!name) return;
      for (const [key, hex] of Object.entries(COLOR_MAP)) {
        if (name.includes(key)) {
          colorsMap.set(hex, f.facetValue.name);
        }
      }
    });

    return Array.from(colorsMap.entries()).map(([hex, name]) => ({
      name,
      hex,
    }));
  }, [facets]);

  const { minPriceLimit, maxPriceLimit } = useMemo(() => {
    if (!initialProducts.length)
      return { minPriceLimit: 0, maxPriceLimit: 100000000 };

    const prices = initialProducts.map(
      (p: any) => p.priceWithTax.min || p.priceWithTax.value,
    );
    return {
      minPriceLimit: Math.min(...prices),
      maxPriceLimit: Math.max(...prices),
    };
  }, [initialProducts]);

  const filteredProducts = useMemo(() => {
    let result = initialProducts.filter((p: any) => {
      // Price (Client-side)
      const price = p.priceWithTax.min || p.priceWithTax.value;
      if (filters.minPrice > 0 && price < filters.minPrice) return false;
      if (filters.maxPrice > 0 && price > filters.maxPrice) return false;

      // Resolve features from IDs
      const productFacets =
        p.facetValueIds
          ?.map((id: string) => facetLookup.get(id))
          .filter(Boolean) || [];

      // Colors (Client-side)
      if (filters.colors.length > 0) {
        const productHexes = getProductColorHexes(p, facetLookup);
        if (!productHexes.some((hex) => filters.colors.includes(hex)))
          return false;
      }

      // Category (Client-side)
      if (filters.category.length > 0) {
        const productCategories = productFacets
          .filter(
            (f: any) =>
              f.facetCode === "category" ||
              f.facetName.toLowerCase() === "category",
          )
          .map((f: any) => f.name);

        // We check if the product has ANY of the selected categories
        if (
          !productCategories.some((c: string) => filters.category.includes(c))
        )
          return false;
      }

      return true;
    });

    // Sorting
    return result.sort((a: any, b: any) => {
      const priceA = a.priceWithTax.min || a.priceWithTax.value;
      const priceB = b.priceWithTax.min || b.priceWithTax.value;

      if (sortBy === "price-asc") return priceA - priceB;
      if (sortBy === "price-desc") return priceB - priceA;
      // Newest - we don't have createdAt in ListedProduct currently.
      return 0;
    });
  }, [initialProducts, filters, sortBy, facetLookup]);

  // Enhanced logic to actually filter if we have data.
  // I will update the filter logic once I ensure data presence.
  // For now, let's implement the UI structure.

  return (
    <div className="bg-white min-h-screen pt-40 pb-40">
      <div className="container mx-auto px-6">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-16 space-y-6">
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-serif text-karima-brand italic font-thin leading-none tracking-tighter">
            {collection.name}
          </h1>

          <div className="w-24 h-[1px] bg-karima-brand/10"></div>

          <p className="text-[10px] uppercase tracking-[0.4em] text-karima-accent font-medium">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "Piece" : "Pieces"}
          </p>
        </div>

        {/* Subcategories (if any) - Only show if no filters active? Or always? */}
        {collection.children?.length && activeFiltersCount === 0 ? (
          <div className="mb-32">
            <div className="flex items-center gap-8 mb-12">
              <h2 className="text-[10px] uppercase tracking-[0.4em] font-bold text-karima-brand whitespace-nowrap">
                Shop by Category
              </h2>
              <div className="w-full h-[1px] bg-karima-brand/5"></div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
              {collection.children.map((child: any) => (
                <CollectionCard key={child.id} collection={child} />
              ))}
            </div>
          </div>
        ) : null}

        {/* Toolbar */}
        <div className="bg-white border-b border-karima-brand/10 py-4 mb-8 flex items-center justify-between sticky top-[62px] lg:top-[80px] z-30">
          {/* Filter Toggle (Mobile Only) */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 text-xxs uppercase tracking-widest text-karima-brand"
          >
            <Filter size={16} /> Filters{" "}
            {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ""}
          </button>

          {/* Desktop Filter Label */}
          <span className="hidden lg:block text-xxs uppercase tracking-widest text-karima-ink/40">
            Filtration
          </span>

          <div className="flex items-center gap-6">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 group relative">
              <span className="text-xxs uppercase tracking-widest text-karima-ink/40">
                Sort By
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-serif italic text-karima-brand focus:outline-hidden cursor-pointer border-none appearance-none pr-4"
              >
                <option value="newest">Newest in</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

            {/* Grid Toggle (Desktop) */}
            <div className="hidden lg:flex items-center gap-2 border-l border-karima-brand/10 pl-6">
              <button
                onClick={() => setGridCols(2)}
                className={`p-1 hover:text-karima-brand ${gridCols === 2 ? "text-karima-brand" : "text-karima-ink/30"}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setGridCols(3)}
                className={`p-1 hover:text-karima-brand ${gridCols === 3 ? "text-karima-brand" : "text-karima-ink/30"}`}
              >
                <Grid3x3 size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 relative items-start">
          {/* Sidebar Filters (Desktop) */}
          <div className="hidden lg:block w-64 shrink-0 h-fit sticky top-40">
            <FilterSidebar
              isOpen={isFilterOpen}
              filters={filters}
              availableCategories={availableCategories}
              availableColors={availableColors}
              minPriceLimit={minPriceLimit}
              maxPriceLimit={maxPriceLimit}
              onUpdateFilters={setFilters}
              onClearFilters={() =>
                setFilters({
                  category: [],
                  colors: [],
                  minPrice: minPriceLimit,
                  maxPrice: maxPriceLimit,
                })
              }
              onClose={() => setIsFilterOpen(false)}
            />
          </div>

          {/* Filter Sidebar (Mobile Drawer) */}
          <div className="lg:hidden">
            <FilterSidebar
              isOpen={isFilterOpen}
              filters={filters}
              availableCategories={availableCategories}
              availableColors={availableColors}
              minPriceLimit={minPriceLimit}
              maxPriceLimit={maxPriceLimit}
              onUpdateFilters={setFilters}
              onClearFilters={() =>
                setFilters({
                  category: [],
                  colors: [],
                  minPrice: minPriceLimit,
                  maxPrice: maxPriceLimit,
                })
              }
              onClose={() => setIsFilterOpen(false)}
            />
          </div>

          {/* Product Grid */}
          <div className="flex-1 min-h-[50vh]">
            {filteredProducts.length > 0 ? (
              <div
                className={`grid gap-x-4 gap-y-12 md:gap-x-12 md:gap-y-32 ${gridCols === 3 ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-2"}`}
              >
                {filteredProducts.map((item: any, idx: number) => {
                  const productFacets =
                    item.facetValueIds
                      ?.map((id: string) => facetLookup.get(id))
                      .filter(Boolean) || [];
                  const categoryFacet = productFacets.find(
                    (f: any) =>
                      f.facetCode?.toLowerCase() === "category" ||
                      f.facetName?.toLowerCase() === "category",
                  );
                  const colorFacets = productFacets.filter(
                    (f: any) =>
                      ["color", "colour", "warna"].includes(
                        f.facetCode?.toLowerCase(),
                      ) ||
                      ["color", "colour", "warna"].includes(
                        f.facetName?.toLowerCase(),
                      ),
                  );

                  const colorValues = getProductColorHexes(item, facetLookup);

                  return (
                    <div key={item.productId}>
                      <ProductCard
                        {...item}
                        category={categoryFacet?.name}
                        colors={colorValues}
                        productVariantId={item.productVariantId}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-40 text-center border-t border-karima-brand/5">
                <p className="text-serif italic text-2xl text-karima-brand/40">
                  No products match your filters.
                </p>
                <button
                  onClick={() =>
                    setFilters({
                      category: [],
                      colors: [],
                      minPrice: minPriceLimit,
                      maxPrice: maxPriceLimit,
                    })
                  }
                  className="mt-8 inline-block text-micro uppercase tracking-[0.3em] font-bold text-karima-brand border-b border-karima-brand/20 pb-2"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <div className="bg-white min-h-screen pt-48 flex items-center justify-center text-center px-6">
      <div className="space-y-8">
        <h1 className="text-7xl md:text-9xl font-serif text-karima-brand italic opacity-10">
          404
        </h1>
        <h2 className="text-2xl font-serif italic text-karima-brand">
          The collection you seek is elsewhere.
        </h2>
        <div className="w-12 h-[1px] bg-karima-brand/20 mx-auto"></div>
        <Link
          to="/"
          className="block text-[10px] uppercase tracking-[0.4em] font-bold text-karima-brand"
        >
          Back to Karima
        </Link>
      </div>
    </div>
  );
}
