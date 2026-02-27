import { Link } from "react-router";
import { Play } from "lucide-react";

interface VideoSectionProps {
    videoUrl?: string;
    posterUrl?: string;
    title?: string;
    ctaText?: string;
    ctaLink?: string;
}

export function VideoSection({
    videoUrl = "/videos/Karima - Teaser Campaign.mp4",
    posterUrl = "/images/marwah-series.jpg",
    title = "Faithfully Beautiful.",
    ctaText = "Discover the Story",
    ctaLink = "/about",
}: VideoSectionProps) {
    return (
        <section className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden bg-black">
            <div className="absolute inset-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster={posterUrl}
                    className="w-full h-full object-cover opacity-60 scale-105"
                >
                    <source src={videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                <div className="absolute inset-0 bg-black/40"></div>
            </div>

            <div className="relative z-10 w-full h-full flex flex-col justify-between container mx-auto px-6 py-12 md:py-24">
                {/* Floating Detail Top */}
                <div className="flex justify-between items-start text-white/50 w-full animate-fade-in delay-500">
                    <span className="text-micro uppercase tracking-widest font-mono">01 // The Core</span>
                    <span className="text-micro uppercase tracking-widest font-serif italic text-white/50 border-b border-white/20 pb-1">Jakarta Atelier</span>
                </div>

                <div className="flex flex-col items-center justify-center text-center">
                    <h2 className="text-6xl md:text-8xl lg:text-9xl font-serif text-white italic font-thin mb-16 max-w-4xl leading-[0.9] tracking-tight hover:italic transition-all duration-1000">
                        {title.split(" ").map((w, i) => (
                            <span key={i} className={i === 0 ? "not-italic font-light opacity-80" : ""}>{w} </span>
                        ))}
                    </h2>

                    <Link
                        to={ctaLink}
                        className="group flex flex-col items-center gap-8 relative"
                    >
                        {/* Minimal Play Button */}
                        <div className="relative flex items-center justify-center">
                            <svg className="w-20 h-20 md:w-24 md:h-24 absolute animate-[spin_20s_linear_infinite] opacity-30 group-hover:opacity-100 transition-opacity duration-700" viewBox="0 0 100 100">
                                <path id="circlePath" fill="none" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
                                <text className="text-[10px] font-mono fill-white tracking-widest uppercase">
                                    <textPath href="#circlePath">Discover The Story • Karima Signature •</textPath>
                                </text>
                            </svg>
                            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white transition-all duration-700 z-10 backdrop-blur-sm">
                                <Play className="text-white group-hover:text-karima-brand fill-current ml-1" size={16} />
                            </div>
                        </div>

                        <span className="text-xxs font-bold uppercase tracking-[0.4em] text-white/70 group-hover:text-white transition-colors relative after:content-[''] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-px after:bg-white group-hover:after:w-full after:transition-all after:duration-500">
                            {ctaText}
                        </span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
