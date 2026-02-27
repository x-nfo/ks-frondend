import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";

interface AboutSectionProps {
    imageUrl?: string;
    title?: string;
    subtitle?: string;
    description?: string;
    ctaText?: string;
    ctaLink?: string;
}

export function AboutSection({
    imageUrl = "/images/marwah-series.jpg",
    title = "Faithfully Beautiful.",
    subtitle = "Our Heritage",
    description = "Karima was born from a desire to bridge the gap between contemporary fashion and modest traditions. We believe that elegance is not about being noticed, but about being remembered.",
    ctaText = "Read Our Story",
    ctaLink = "/about",
}: AboutSectionProps) {
    return (
        <section className="bg-white py-24 px-6 lg:px-12">
            <div className="container mx-auto">
                <div className="flex flex-col items-center text-center md:items-start md:text-left mb-12">
                    <span className="text-[10px] text-karima-accent uppercase tracking-[0.4em] mb-4 block font-medium">
                        {subtitle}
                    </span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-karima-brand italic font-thin tracking-tight">
                        About Karima.
                    </h2>
                </div>

                {/* Hero Image */}
                <div className="w-full aspect-21/9 md:aspect-video bg-stone-100 mb-16 overflow-hidden rounded-sm">
                    <img
                        src={imageUrl}
                        className="w-full h-full object-cover"
                        alt="Atelier"
                    />
                </div>

                {/* Split Text Content */}
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-24">
                    {/* Bold Statement */}
                    <div>
                        <h3 className="text-5xl md:text-6xl lg:text-7xl font-serif text-karima-brand leading-tight max-w-lg font-thin">
                            {title.split(".").join("").split(" ").map((word, i) => (
                                <span key={i} className={i % 2 !== 0 ? "italic opacity-80" : ""}>{word} </span>
                            ))}
                        </h3>
                    </div>

                    {/* Paragraph & CTA */}
                    <div className="flex flex-col items-center text-center md:items-start md:text-left justify-between">
                        <p className="text-karima-ink/70 font-sans font-light text-[15px] md:text-lg leading-[1.8] max-w-lg mb-12 px-6 md:px-0">
                            {description}
                        </p>

                        <div>
                            <Link
                                to={ctaLink}
                                className="group inline-flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.3em] text-karima-brand border-b border-karima-brand/20 pb-2 hover:border-karima-brand transition-colors"
                            >
                                <span>{ctaText}</span>
                                <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
