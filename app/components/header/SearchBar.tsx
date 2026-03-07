import { Form, useSearchParams, useFetcher, Link } from "react-router";
import { useEffect, useRef, useState } from "react";
import { ProductCard } from "../products/ProductCard";
import { COLOR_MAP } from "../../constants";

export function SearchBar({
  onSelect,
  facetCategories = [],
}: {
  onSelect?: () => void;
  facetCategories?: string[];
}) {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const fetcher = useFetcher<any>();
  const debounceRef = useRef<any>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        fetcher.load(`/search?q=${encodeURIComponent(query)}`);
      }, 300);
    }
  }, [query, fetcher]);

  const products = fetcher.data?.products || [];
  const isLoading = fetcher.state !== "idle";
  const showSuggestions = query.trim().length === 0;
  const showResults = query.trim().length >= 2;

  return (
    <div className="w-full relative">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-5xl font-serif text-karima-brand/80 italic font-thin leading-none tracking-tighter">
          Search
        </h2>
      </div>
      <Form
        method="get"
        action="/search"
        key={initialQuery}
        onSubmit={() => onSelect?.()}
      >
        <input
          type="search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What are you looking for?"
          autoFocus
          autoComplete="off"
          className="block w-full bg-transparent border-0 border-b border-karima-brand/20 px-0 py-4 text-center text-karima-ink text-xl md:text-2xl font-serif placeholder:font-sans placeholder:text-sm placeholder:text-karima-ink/30 focus:outline-none focus:ring-0 focus:border-karima-brand"
        />
      </Form>

      {/* Decorative Dropdown for results */}
      {((showSuggestions && facetCategories.length > 0) || showResults) && (
        <div className="absolute top-full left-0 w-full bg-white/98 backdrop-blur-3xl shadow-2xl mt-4 max-h-[60vh] overflow-y-auto border border-karima-brand/10">

          {/* Default Suggestions (Categories) when empty */}
          {showSuggestions && facetCategories.length > 0 && (
            <div className="p-8">
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-karima-brand/60 mb-6 border-b border-karima-brand/5 pb-2 text-left">
                Popular Categories
              </h3>
              <div className="flex flex-wrap gap-4">
                {facetCategories.map((cat) => (
                  <Link
                    key={cat}
                    to={`/collections/all?category=${encodeURIComponent(cat)}`}
                    onClick={onSelect}
                    className="px-6 py-3 border border-karima-brand/10 text-[10px] font-sans uppercase tracking-[0.1em] text-karima-brand hover:bg-karima-brand hover:text-white transition-colors"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Live Predictive Results */}
          {showResults && (
            <div className="p-8">
              {isLoading && products.length === 0 ? (
                <div className="text-center py-10 font-serif italic text-karima-brand/60">
                  Searching for "{query}"...
                </div>
              ) : products.length > 0 ? (
                <div>
                  <div className="flex justify-between items-center mb-6 border-b border-karima-brand/5 pb-2">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] text-karima-brand/60">
                      Results for "{query}"
                    </h3>
                    <Link
                      to={`/search?q=${encodeURIComponent(query)}`}
                      onClick={onSelect}
                      className="text-[9px] uppercase tracking-[0.2em] text-karima-brand hover:underline font-bold"
                    >
                      View All
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                    {/* Limit to 4 products for the predictive preview */}
                    {products.slice(0, 4).map((p: any) => {
                      const hexes = new Set<string>();
                      if (p.productName) {
                        const prodName = p.productName.toLowerCase();
                        for (const [key, hex] of Object.entries(COLOR_MAP)) {
                          if (prodName.includes(key)) hexes.add(hex);
                        }
                      }
                      return (
                        <div key={p.productId} onClick={onSelect}>
                          <ProductCard
                            {...p}
                            productVariantId={p.productVariantId}
                            colors={Array.from(hexes)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 font-serif italic text-karima-brand/60">
                  No matches found for "{query}".
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
