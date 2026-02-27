import { Link } from "react-router";
// Using any for now to avoid deep type dependencies, or import from generated
import { type CollectionsQuery } from "../../generated/graphql";

export function CollectionCard({ collection }: { collection: any }) {
  return (
    <Link
      to={"/collections/" + collection.slug}
      prefetch="intent"
      key={collection.id}
      className="group relative h-[600px] w-full overflow-hidden cursor-pointer bg-stone-100 md:border-r md:border-white/10 block"
    >
      <img
        src={collection.featuredAsset?.preview + "?w=600&h=800&fit=crop"}
        className="w-full h-full object-cover transition-transform duration-[2s] ease-out grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105"
        alt={collection.name}
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-700"></div>

      <div className="absolute inset-0 flex flex-col items-center justify-end pb-12">
        <span className="text-4xl font-serif text-white tracking-wide group-hover:-translate-y-4 transition-transform duration-700 drop-shadow-md">
          {collection.name}
        </span>
        <div className="h-0 overflow-hidden group-hover:h-8 transition-all duration-700">
          <span className="text-[9px] text-white uppercase tracking-[0.3em] border-b border-white/50 pb-1">
            Shop Category
          </span>
        </div>
      </div>
    </Link>
  );
}
