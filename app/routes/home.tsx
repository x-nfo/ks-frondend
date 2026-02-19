import type { Route } from "./+types/home";
import { useLoaderData, Link } from "react-router";
import { getCollections } from "../providers/collections/collections";
import { CollectionCard } from "../components/collections/CollectionCard";
import { ProductCard } from "../components/products/ProductCard";
import { search, searchFacetValues } from "../providers/products/products";
import { ArrowUpRight, Mail, Sparkles } from "lucide-react";
import { getHomepageData } from "../providers/homepage/homepage";
import Popup from "../components/popup/Popup";
import { SortOrder } from "../generated/graphql";
import { Banner } from "../components/banner/Banner";
import { useState } from "react";
import { subscribeToNewsletter } from "../providers/newsletter/newsletter";
import { APP_META_TITLE, APP_META_TAGLINE, APP_META_DESCRIPTION } from "../constants";
import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: `${APP_META_TITLE} | ${APP_META_TAGLINE}` },
    { name: "description", content: APP_META_DESCRIPTION },
    { property: "og:title", content: APP_META_TITLE },
    { property: "og:description", content: APP_META_DESCRIPTION },
    { property: "og:type", content: "website" },
  ];
};

export async function loader({ request, context }: Route.LoaderArgs) {
  const kv = context.cloudflare.env.KV_CACHE;
  const apiUrl = (context.cloudflare.env as any).VENDURE_API_URL || process.env.VENDURE_API_URL || 'http://localhost:3000/shop-api';
  const options = { request, kv, apiUrl };

  const allCollections = await getCollections({ take: 100 }, options);
  const homepageData = await getHomepageData(options);
  const {
    activeHeroBanners,
    activePromoBanners,
    activeFeaturedCollections,
    activePopup
  } = homepageData;

  const heroBanner = activeHeroBanners.length > 0 ? activeHeroBanners[0] : null;

  const collectionsArray = Array.isArray(allCollections) ? allCollections : (allCollections as any).items || [];

  const featuredCollections = activeFeaturedCollections
    .map((afc: any) => collectionsArray.find((c: any) => c.id === afc.collectionId))
    .filter(Boolean);

  let featuredProducts: any[] = [];
  if (featuredCollections.length > 0) {
    const featuredCollectionId = featuredCollections[0].id;
    const searchResult = await search(
      {
        input: {
          collectionId: featuredCollectionId,
          take: 6,
          groupByProduct: true,
          sort: { name: SortOrder.Asc }
        }
      },
      options
    );
    featuredProducts = searchResult.search.items;
  } else {
    const searchResult = await search(
      {
        input: {
          take: 6,
          groupByProduct: true,
          sort: { name: SortOrder.Desc }
        }
      },
      options
    );
    featuredProducts = searchResult.search.items;
  }

  const facetValuesResult = await searchFacetValues(
    {
      input: {
        groupByProduct: true,
        take: 100
      }
    },
    options
  );

  const facetLookup = facetValuesResult.search.facetValues.reduce((acc: any, curr: any) => {
    acc[curr.facetValue.id] = curr.facetValue;
    return acc;
  }, {});


  return {
    heroBanner,
    activePromoBanners,
    featuredCollections,
    activePopup: activePopup || null,
    featuredProducts,
    facetLookup
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const {
    heroBanner,
    activePromoBanners,
    featuredCollections,
    activePopup,
    featuredProducts,
    facetLookup
  } = loaderData;

  if (!heroBanner) {
    return null; // Or a loading/skeleton state
  }

  return (
    <div className="animate-fade-in">
      {activePopup && (
        <Popup
          imageUrl={activePopup.imageUrl}
          title={activePopup.title ?? undefined}
          linkUrl={activePopup.linkUrl ?? undefined}
          delay={activePopup.delay ?? undefined}
          frequency={activePopup.frequency ?? undefined}
        />
      )}
      <section className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroBanner.imageUrl}
            className="w-full h-full object-cover animate-zoom-out"
            alt="Hero"
          />
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <span className="text-[10px] text-white uppercase tracking-[0.5em] mb-8 animate-slide-down font-medium">
            {heroBanner.subtitle}
          </span>
          <h1 className="text-7xl md:text-9xl font-serif text-white italic font-thin tracking-tighter mb-12 animate-slide-up">
            {heroBanner.headline.split(' ').map((word: string, i: number) => (
              <span key={i} className={i === 1 ? "opacity-70" : ""}>{word} </span>
            ))}
          </h1>
          <Link to={heroBanner.ctaLink} className="border border-white/30 text-white px-12 py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white hover:text-karima-brand transition-all duration-700 animate-fade-in delay-700">
            {heroBanner.ctaText}
          </Link>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30">
          <div className="w-[1px] h-12 bg-white animate-bounce"></div>
        </div>
      </section>

      {/* 2. MARQUEE */}
      <div className="w-full overflow-hidden py-12 border-b border-karima-brand/5 relative bg-white z-20">
        <div className="flex gap-32 animate-marquee whitespace-nowrap">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-32 opacity-20">
              <span className="text-3xl font-serif italic text-karima-brand">Ramadhan Sale</span>
              <span className="text-[9px] uppercase tracking-[0.4em] font-medium text-karima-brand mt-1">Up to 25% Off</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. NEW ARRIVALS */}
      <section className="py-40 px-6 bg-white lg:px-24">
        <div className="container mx-auto">
          <div className="flex flex-col items-center mb-28">
            <span className="text-[10px] text-karima-accent uppercase tracking-[0.4em] mb-6 block font-medium">New Arrivals</span>
            <h2 className="text-6xl lg:text-8xl font-serif text-karima-brand leading-none text-center font-thin">
              The <span className="italic opacity-70">Essentials.</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-16 md:gap-x-12 md:gap-y-28">
            {featuredProducts.map((product: any, idx: number) => {
              const productFacets = product.facetValueIds?.map((id: string) => facetLookup[id]).filter(Boolean) || [];
              const categoryFacet = productFacets.find((f: any) => f.facet.code === 'category' || f.facet.name.toLowerCase() === 'category');
              const colorFacets = productFacets.filter((f: any) => f.facet.code === 'color' || f.facet.code === 'colour' || f.facet.name.toLowerCase() === 'color');

              const colorValues = colorFacets.map((f: any) => {
                const name = f.name.toLowerCase();
                if (name === 'black') return '#000000';
                if (name === 'navy') return '#1B243B';
                if (name === 'maroon') return '#58181F';
                if (name === 'sage') return '#9CAF88';
                if (name === 'brown') return '#5D4037';
                if (name === 'white') return '#FFFFFF';
                if (name === 'gold') return '#D4AF37';
                return null;
              }).filter(Boolean) as string[];

              return (
                <div key={product.productId}>
                  <ProductCard
                    {...product}
                    category={categoryFacet?.name}
                    colors={colorValues}
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-32 text-center">
            <Link to="/collections/all" className="group text-[10px] font-bold uppercase tracking-[0.3em] text-karima-brand flex items-center justify-center gap-4 mx-auto">
              <span>View Full Collection</span>
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. CURATED CATEGORIES */}
      <section className="bg-white">
        <div className="flex flex-col items-center py-32 border-b border-karima-brand/5">
          <span className="text-[10px] text-karima-accent uppercase tracking-[0.4em] mb-6 block font-medium">Explore</span>
          <h2 className="text-5xl md:text-7xl font-serif text-karima-brand italic font-thin tracking-tight">Curated Collections</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full">
          {featuredCollections.map((collection: any) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </section>

      {activePromoBanners.length > 0 && (
        <Banner
          title={activePromoBanners[0].title || ''}
          description={activePromoBanners[0].description || ''}
          imageUrl={activePromoBanners[0].imageUrl || ''}
          linkUrl={activePromoBanners[0].linkUrl || '#'}
        />
      )}

      {/* 5. BRAND ATMOSPHERE */}
      {/* <section className="relative w-full py-48 overflow-hidden bg-stone-900">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1596451190630-186aff535bf2?q=80&w=1974&auto=format&fit=crop"
            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
            alt="Atelier"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center reveal-on-scroll">
          <Sparkles className="text-karima-gold mx-auto mb-10 opacity-80" size={32} strokeWidth={0.5} />
          <h2 className="text-5xl md:text-8xl font-serif text-white italic font-thin mb-10 leading-tight drop-shadow-2xl">
            Modesty is the <br /> ultimate elegance.
          </h2>
          <div className="w-24 h-[1px] bg-white/20 mx-auto mb-10"></div>
          <p className="max-w-xl mx-auto text-base font-light text-stone-300 leading-loose mb-16 tracking-wide">
            Crafted in Jakarta using the finest Medina Silk. <br />
            Designed for the modern woman who seeks grace in every layer.
          </p>
          <Link to="/collections/all" className="border border-white/30 text-white px-12 py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white hover:text-karima-brand transition-all duration-500">
            Our Heritage
          </Link>
        </div>
      </section> */}

      {/* 6. NEWSLETTER */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto flex flex-col items-center">
          <div className="w-full max-w-xl text-center">
            <div className="flex justify-center mb-8 text-karima-brand">
              <Mail size={24} strokeWidth={0.5} />
            </div>
            <h3 className="text-4xl md:text-6xl font-serif text-karima-brand italic mb-6">The Inner Circle</h3>
            <p className="text-karima-ink/40 mb-12 font-light text-sm tracking-widest uppercase">
              Early access to limited textile drops.
            </p>

            <NewsletterForm />
          </div>
        </div>
      </section>
    </div>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      await subscribeToNewsletter(email);
      setStatus("success");
      setMessage("Welcome to the inner circle.");
      setEmail("");
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative">
      <form className="flex flex-row items-center border-b border-karima-brand/20 w-full relative" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email address"
          className="bg-transparent border-none px-0 py-4 text-center text-karima-ink text-sm font-light tracking-wide placeholder:font-light placeholder:text-sm placeholder:text-karima-ink/30 focus:outline-none focus:ring-0 w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading" || status === "success"}
        />
        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className="absolute right-0 text-[10px] font-bold uppercase tracking-[0.2em] text-karima-brand disabled:opacity-50"
        >
          {status === "loading" ? "..." : "Join"}
        </button>
      </form>
      {message && (
        <p className={`absolute top-full left-0 right-0 text-center mt-2 text-xs tracking-widest uppercase ${status === "error" ? "text-red-500" : "text-karima-brand"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
