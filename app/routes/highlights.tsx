import { Link } from "react-router";
import { ArrowLeft, Sparkles, Calendar } from "lucide-react";

export default function Highlights() {
  return (
    <div className="min-h-screen pt-40 md:pt-52 pb-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-karima-ink/40 hover:text-karima-brand transition-colors text-xs uppercase tracking-widest group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />{" "}
          Back to Home
        </Link>
      </div>
      <div className="container mx-auto max-w-5xl px-6">
        <div className="text-center mb-16">
          <span className="text-xxs text-karima-accent uppercase tracking-[0.3em] font-medium block mb-4">
            New & Noteworthy
          </span>
          <h1 className="text-4xl md:text-6xl font-serif text-karima-brand italic mb-8">
            Highlights & Launches
          </h1>
          <p className="text-karima-ink/60 font-light max-w-2xl mx-auto leading-relaxed text-lg">
            Stay updated with our latest collections, limited edition releases,
            and upcoming product drops.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-16 mb-24">
          {/* Placeholder for a highlight item */}
          <div className="group cursor-pointer">
            <div className="aspect-[4/3] bg-stone-100 overflow-hidden mb-8 relative">
              {/* Image placeholder */}
              <div className="absolute inset-0 flex items-center justify-center bg-karima-brand/5 text-karima-brand/20">
                [Collection Image]
              </div>
            </div>
            <span className="text-xs uppercase tracking-widest text-karima-gold mb-3 block">
              Fall / Winter 2025
            </span>
            <h2 className="text-3xl font-serif text-karima-brand mb-4 leading-tight group-hover:text-karima-gold transition-colors">
              The Medina Collection
            </h2>
            <p className="text-karima-ink/60 font-light text-sm leading-relaxed mb-6">
              Inspired by the ancient city, this collection features earthy
              tones, flowing silhouettes, and intricate embroidery.
            </p>
            <Link
              to="/collections/medina"
              className="text-xs uppercase tracking-widest text-karima-brand border-b border-karima-brand/30 pb-1 hover:border-karima-brand transition-all"
            >
              Explore Collection
            </Link>
          </div>

          <div className="group cursor-pointer">
            <div className="aspect-[4/3] bg-stone-100 overflow-hidden mb-8 relative">
              {/* Image placeholder */}
              <div className="absolute inset-0 flex items-center justify-center bg-karima-brand/5 text-karima-brand/20">
                [Launch Image]
              </div>
            </div>
            <span className="text-xs uppercase tracking-widest text-karima-gold mb-3 block">
              Limited Edition
            </span>
            <h2 className="text-3xl font-serif text-karima-brand mb-4 leading-tight group-hover:text-karima-gold transition-colors">
              Eid Al-Fitr Exclusive
            </h2>
            <p className="text-karima-ink/60 font-light text-sm leading-relaxed mb-6">
              A curated selection of luxurious abayas designed specifically for
              the festive season. Limited quantities available.
            </p>
            <Link
              to="/collections/eid-exclusive"
              className="text-xs uppercase tracking-widest text-karima-brand border-b border-karima-brand/30 pb-1 hover:border-karima-brand transition-all"
            >
              View Lookbook
            </Link>
          </div>
        </div>

        <div className="bg-karima-base/50 p-12 text-center border border-karima-brand/5">
          <Calendar
            size={32}
            strokeWidth={1}
            className="mx-auto text-karima-gold mb-6"
          />
          <h3 className="text-2xl font-serif text-karima-brand italic mb-4">
            Upcoming Drop
          </h3>
          <p className="text-karima-ink/70 font-light mb-2">October 15, 2025</p>
          <p className="text-lg font-medium text-karima-brand uppercase tracking-widest">
            Midnight Velvet Series
          </p>
        </div>
      </div>
    </div>
  );
}
