
import { useLoaderData, Link } from "react-router";
import { search } from "../providers/products/products";
import { ProductCard } from "../components/products/ProductCard";
import { APP_META_TITLE } from "../constants";

// Define LoaderArgs type locally if not available globally or import it if needed
// Assuming standard Remix/React Router LoaderArgs
import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") || "";

    if (!q) {
        return {
            term: "",
            products: [],
            totalProducts: 0
        };
    }

    const searchResult = await search(
        {
            input: {
                term: q,
                groupByProduct: true,
                take: 50,
            },
        },
        { request }
    );

    return {
        term: q,
        products: searchResult.search?.items || [],
        totalProducts: searchResult.search?.totalItems || 0,
    };
}

export function meta({ data }: { data: any }) {
    return [
        {
            title: data?.term
                ? `Search: ${data.term} - ${APP_META_TITLE}`
                : `Search - ${APP_META_TITLE}`,
        },
    ];
}

export default function SearchPage() {
    const { term, products, totalProducts } = useLoaderData<typeof loader>();

    return (
        <div className="bg-white min-h-screen pt-32 pb-40 animate-fade-in">
            <div className="container mx-auto px-6">

                {/* Header Section */}
                <div className="flex flex-col items-center text-center mb-16 space-y-6">
                    <h1 className="text-4xl md:text-6xl font-serif text-karima-brand italic font-thin leading-none tracking-tighter">
                        {term ? `Search: "${term}"` : "Search"}
                    </h1>

                    {term && (
                        <>
                            <div className="w-24 h-[1px] bg-karima-brand/10"></div>
                            <p className="text-[10px] uppercase tracking-[0.4em] text-karima-accent font-medium">
                                {products.length} {products.length === 1 ? 'Result' : 'Results'}
                            </p>
                        </>
                    )}
                </div>

                {products.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-12 md:gap-y-16">
                        {products.map((item: any, idx: number) => (
                            <div key={item.productId} className="reveal-on-scroll" style={{ transitionDelay: `${(idx % 4) * 100}ms` }}>
                                <ProductCard
                                    {...item}
                                    productVariantId={item.productVariantId}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center flex flex-col items-center">
                        <div className="w-16 h-[1px] bg-karima-brand/20 mb-8"></div>
                        <p className="font-serif italic text-2xl text-karima-brand/60 mb-8">
                            {term ? "We couldn't find any matches." : "Start typing to search."}
                        </p>
                        <Link
                            to="/collections/all"
                            className="text-[10px] uppercase tracking-[0.2em] font-medium text-karima-brand border-b border-karima-brand/20 pb-1 hover:border-karima-brand transition-all"
                        >
                            View All Collections
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
