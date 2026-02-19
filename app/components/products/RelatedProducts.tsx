import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { Price } from './Price';
import { CurrencyCode } from '~/generated/graphql';

interface RelatedProduct {
    productId: string;
    productName: string;
    slug: string;
    productAsset?: {
        preview: string;
    };
    priceWithTax: any;
    currencyCode: CurrencyCode;
}

interface RelatedProductsProps {
    products: RelatedProduct[];
    onTransition?: () => void;
}

export function RelatedProducts({ products, onTransition }: RelatedProductsProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    if (products.length === 0) return null;

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = 350; // Width of card + gap
            if (direction === 'left') {
                current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    return (
        <section className="py-12 mt-8 lg:mt-16">
            <div className="container mx-auto px-6 max-w-7xl">
                {/* Header with Navigation */}
                <div className="flex justify-between items-end mb-8 px-2">
                    <div>
                        <span className="text-[10px] text-karima-accent uppercase tracking-[0.25em] font-bold block mb-2">Complete The Look</span>
                        <h3 className="text-2xl md:text-3xl font-serif text-karima-brand italic">You Might Also Like</h3>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => scroll('left')}
                            className="w-10 h-10 border border-karima-brand/20 flex items-center justify-center hover:border-karima-brand hover:bg-karima-brand hover:text-white transition-all disabled:opacity-50 text-karima-brand"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft size={18} strokeWidth={1} />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="w-10 h-10 border border-karima-brand/20 flex items-center justify-center hover:border-karima-brand hover:bg-karima-brand hover:text-white transition-all text-karima-brand"
                            aria-label="Scroll right"
                        >
                            <ChevronRight size={18} strokeWidth={1} />
                        </button>
                    </div>
                </div>

                {/* Scrollable Container */}
                <div
                    ref={scrollRef}
                    className="flex gap-4 md:gap-5 overflow-x-auto no-scrollbar pb-6 snap-x snap-mandatory scroll-smooth"
                >
                    {products.map((product) => (
                        <RelatedProductItem
                            key={product.productId}
                            product={product}
                            onTransition={onTransition}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

function RelatedProductItem({ product, onTransition }: { product: RelatedProduct; onTransition?: () => void }) {
    const to = `/products/${product.slug}`;

    return (
        <Link
            to={to}
            viewTransition
            className="min-w-[45%] md:min-w-[calc(25%-1rem)] cursor-pointer group snap-start block"
        >
            {/* Image Container */}
            <div className="w-full aspect-[4/5] mb-4 overflow-hidden relative bg-stone-100">
                <img
                    src={product.productAsset?.preview + '?w=400'}
                    alt={product.productName}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                {/* Quick Add Overlay */}
                <div className="absolute inset-0 bg-karima-brand/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Product Info */}
            <div className="space-y-1 text-center md:text-left">
                <h4
                    className="font-serif text-base text-karima-brand"
                >
                    {product.productName}
                </h4>

                <div className="pt-0.5 font-bold text-xs text-karima-ink">
                    <Price
                        priceWithTax={product.priceWithTax}
                        currencyCode={product.currencyCode}
                    />
                </div>
            </div>
        </Link>
    );
}
