import { Link } from "react-router";

interface BannerProps {
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
}

export function Banner({ title, description, imageUrl, linkUrl }: BannerProps) {
  return (
    <section className="mt-15 py-6 md:py-12 px-4 md:px-6 bg-white">
      <div className="container mx-auto bg-karima-brand relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-5 mix-blend-overlay pointer-events-none">
          <svg width="100%" height="100%">
            <filter id="noise">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.8"
                numOctaves="3"
                stitchTiles="stitch"
              ></feTurbulence>
            </filter>
            <rect width="100%" height="100%" filter="url(#noise)"></rect>
          </svg>
        </div>
        <div className="flex flex-row items-center h-[200px] md:h-auto">
          <div className="w-[60%] md:w-[70%] py-6 px-4 md:py-16 md:px-24 text-left z-10 flex flex-col justify-center h-full">
            <h2 className="text-4xl md:text-8xl font-serif text-white italic mb-4 md:mb-6 leading-tight whitespace-nowrap">
              {title}
            </h2>
            <p className="hidden md:block text-white/80 text-sm font-light tracking-wide mb-8 max-w-lg leading-relaxed mix-blend-plus-lighter">
              {description}
            </p>
            <Link
              to={linkUrl}
              className="inline-block border border-white/40 text-white px-6 py-2 md:px-10 md:py-4 text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] hover:bg-white hover:text-karima-brand transition-all duration-500 rounded-full w-fit"
            >
              SHOP NOW
            </Link>
          </div>
          <div className="w-[40%] md:w-[60%] h-full md:h-[450px] absolute right-0 top-0 bottom-0 pointer-events-none md:relative">
            <div className="absolute inset-0 bg-gradient-to-r from-karima-brand via-karima-brand/80 to-transparent z-10 md:via-karima-brand/40"></div>
            <img
              alt={title}
              className="w-full h-full object-cover object-center opacity-100 mix-blend-overlay md:opacity-100 md:mix-blend-normal"
              src={imageUrl}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
