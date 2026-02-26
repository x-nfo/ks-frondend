import { Link } from "react-router";
import {
  ArrowLeft,
  Sparkles,
  Sprout,
  HeartHandshake,
  Scissors,
} from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen pt-40 md:pt-52 pb-24 bg-white relative">
      {/* Back Link */}
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
        {/* Hero Text */}
        <div className="text-center mb-24 md:mb-32">
          <span className="text-xxs text-karima-accent uppercase tracking-[0.3em] font-medium block mb-6">
            The Atelier
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-karima-brand italic mb-8 leading-tight">
            Faithfully{" "}
            <span className="font-light not-italic text-karima-ink/80">
              Beautiful.
            </span>
          </h1>
          <div className="w-24 h-[1px] bg-karima-brand/10 mx-auto mb-8"></div>
          <p className="text-karima-ink/70 font-light text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Karima was born from a desire to bridge the gap between contemporary
            fashion and modest traditions. We believe that elegance is not about
            being noticed, but about being remembered.
          </p>
        </div>

        {/* Craftsmanship Section */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
          <div className="order-2 md:order-1 space-y-8">
            <div className="flex items-center gap-3 text-karima-gold">
              <Scissors size={24} strokeWidth={1} />
              <h3 className="text-sm uppercase tracking-[0.2em] font-medium text-karima-brand">
                Artisan Crafted
              </h3>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif text-karima-brand italic">
              Details that whisper <br /> luxury.
            </h2>
            <p className="text-karima-ink/70 font-light leading-loose">
              Every Karima piece is meticulously crafted in our Jakarta atelier.
              We reject fast fashion in favor of slow, deliberate creation. Our
              master tailors spend hours ensuring every hem, stitch, and drape
              meets our exacting standards.
            </p>
            <p className="text-karima-ink/70 font-light leading-loose">
              We exclusively use <strong>Medina Silk</strong> and premium blends
              that offer breathability without compromising opacity—perfect for
              the modern woman moving through a busy world.
            </p>
          </div>
          <div className="order-1 md:order-2 relative aspect-[4/5] bg-stone-100 overflow-hidden group">
            {/* Video placeholder or actual video if available */}
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover opacity-90"
            >
              <source
                src="/videos/Karima - Teaser Campaign.mp4"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 bg-karima-brand/5 pointer-events-none"></div>
          </div>
        </div>

        {/* Values / Philosophy */}
        <div className="bg-karima-base/50 p-12 md:p-20 mb-32 border border-karima-brand/5 relative overflow-hidden">
          <Sparkles
            className="absolute top-10 right-10 text-karima-gold opacity-30"
            size={120}
            strokeWidth={0.5}
          />

          <div className="relative z-10 max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-serif text-karima-brand mb-12">
              Our Philosophy
            </h2>
            <div className="grid sm:grid-cols-2 gap-12">
              <div>
                <div className="mb-4 text-karima-brand">
                  <Sprout size={28} strokeWidth={1} />
                </div>
                <h4 className="text-lg font-serif italic text-karima-brand mb-3">
                  Ethical Sourcing
                </h4>
                <p className="text-sm text-karima-ink/60 font-light leading-relaxed">
                  We partner directly with textile mills that prioritize
                  sustainable practices and fair labor conditions.
                </p>
              </div>
              <div>
                <div className="mb-4 text-karima-brand">
                  <HeartHandshake size={28} strokeWidth={1} />
                </div>
                <h4 className="text-lg font-serif italic text-karima-brand mb-3">
                  Community First
                </h4>
                <p className="text-sm text-karima-ink/60 font-light leading-relaxed">
                  A portion of our proceeds supports local education initiatives
                  in Jakarta. When you wear Karima, you carry a story of
                  empowerment.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Founder's Note */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="mb-8">
            <img
              src="/images/marwah-series.jpg"
              alt="Founder"
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover mx-auto mb-6 grayscale"
            />
          </div>
          <blockquote className="text-2xl md:text-3xl font-serif text-karima-brand italic leading-relaxed mb-8">
            "Modesty isn't about hiding. It's about revealing your dignity and
            grace on your own terms."
          </blockquote>
          <cite className="not-italic">
            <span className="block text-xs uppercase tracking-[0.2em] font-bold text-karima-brand">
              Kartika Arum
            </span>
            <span className="block text-xs text-karima-ink/50 mt-1 font-serif italic">
              Founder & Creative Director
            </span>
          </cite>
        </div>
      </div>
    </div>
  );
}
