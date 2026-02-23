import type { MetaFunction } from "react-router";
import { useState, useEffect } from "react";
import { APP_META_TITLE } from "../constants";
import { subscribeToNewsletter } from "../providers/newsletter/newsletter";

export const meta: MetaFunction = () => [
    { title: `${APP_META_TITLE} — Coming Soon` },
    { name: "description", content: "Something beautiful is on its way. Karima is preparing something special for you." },
    { name: "robots", content: "noindex, nofollow" },
];

// Target launch date — change as needed
const LAUNCH_DATE = new Date("2026-03-20T00:00:00+07:00");

function useCountdown(target: Date) {
    const calc = () => {
        const diff = Math.max(0, target.getTime() - Date.now());
        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
            seconds: Math.floor((diff / 1000) % 60),
        };
    };

    const [time, setTime] = useState(calc);

    useEffect(() => {
        const id = setInterval(() => setTime(calc()), 1000);
        return () => clearInterval(id);
    }, []);

    return time;
}

export default function UnderConstruction() {
    const { days, hours, minutes, seconds } = useCountdown(LAUNCH_DATE);
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setStatus("loading");
        try {
            await subscribeToNewsletter(email);
            setStatus("success");
            setEmail("");
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            setStatus("idle");
            // You could add an error state here if you want to show a specific error message
            alert("Terjadi kesalahan saat menyimpan email. Silakan coba lagi.");
        }
    };

    return (
        <div className="min-h-screen bg-karima-base flex flex-col items-center justify-center relative overflow-hidden px-6">

            {/* Decorative orbs */}
            <div
                className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full opacity-20"
                style={{ background: "radial-gradient(circle, #c5a059 0%, transparent 70%)" }}
            />
            <div
                className="absolute bottom-[-200px] right-[-200px] w-[600px] h-[600px] rounded-full opacity-15"
                style={{ background: "radial-gradient(circle, #8c544f 0%, transparent 70%)" }}
            />

            {/* Fine grain texture overlay */}
            <div className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundSize: "200px 200px"
                }}
            />

            <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center text-center animate-fade-in">

                {/* Logo / Brand */}
                <span className="text-[10px] uppercase tracking-[0.5em] text-karima-accent font-medium mb-8">
                    Karima
                </span>

                {/* Ornamental divider */}
                <div className="flex items-center gap-4 mb-12">
                    <div className="h-[1px] w-16 bg-karima-brand/20" />
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-karima-gold opacity-60">
                        <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5L6 0Z" fill="currentColor" />
                    </svg>
                    <div className="h-[1px] w-16 bg-karima-brand/20" />
                </div>

                {/* Headline */}
                <h1 className="text-6xl md:text-8xl font-serif text-karima-brand italic font-thin tracking-tighter leading-none mb-6">
                    Something<br />
                    <span className="opacity-60">beautiful</span>
                </h1>
                <p className="text-xs uppercase tracking-[0.4em] text-karima-accent font-medium mb-4">
                    is on its way
                </p>

                {/* Sub */}
                <p className="text-karima-ink/50 text-sm font-light leading-loose tracking-wide max-w-sm mb-16">
                    We are putting the finishing touches on our new collection. Sign up below to be the first to know when we launch.
                </p>

                {/* Countdown */}
                <div className="grid grid-cols-4 gap-6 md:gap-10 mb-20 w-full max-w-md">
                    {[
                        { label: "Days", value: days },
                        { label: "Hours", value: hours },
                        { label: "Min", value: minutes },
                        { label: "Sec", value: seconds },
                    ].map(({ label, value }) => (
                        <div key={label} className="flex flex-col items-center gap-2">
                            <div className="w-full aspect-square border border-karima-brand/10 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-sm shadow-sm">
                                <span className="text-3xl md:text-4xl font-serif text-karima-brand font-thin tabular-nums">
                                    {String(value).padStart(2, "0")}
                                </span>
                            </div>
                            <span className="text-[9px] uppercase tracking-[0.35em] text-karima-accent/70 font-medium">
                                {label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Newsletter */}
                {status === "success" ? (
                    <div className="flex flex-col items-center gap-3 animate-fade-in">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-karima-gold">
                            <path d="M3 10L8 15L17 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="text-xs uppercase tracking-[0.3em] text-karima-brand font-medium">
                            You're on the list.
                        </p>
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="w-full max-w-sm flex flex-col sm:flex-row items-stretch gap-3"
                    >
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Your email address"
                            disabled={status === "loading"}
                            className="flex-1 bg-white/70 backdrop-blur-sm border border-karima-brand/15 px-5 py-3.5 text-sm text-karima-ink placeholder:text-karima-ink/30 focus:outline-none focus:border-karima-brand/40 transition-colors duration-300 font-light tracking-wide"
                        />
                        <button
                            type="submit"
                            disabled={status === "loading"}
                            className="bg-karima-brand text-white text-[10px] uppercase tracking-[0.3em] font-bold px-7 py-3.5 hover:bg-karima-accent transition-colors duration-300 disabled:opacity-60 whitespace-nowrap"
                        >
                            {status === "loading" ? "..." : "Notify Me"}
                        </button>
                    </form>
                )}

                {/* Social links */}
                <div className="flex items-center gap-8 mt-16">
                    <a
                        href="https://instagram.com/karimasyari"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] uppercase tracking-[0.35em] text-karima-ink/40 hover:text-karima-accent transition-colors duration-300 font-medium"
                    >
                        Instagram
                    </a>
                    <div className="w-[1px] h-3 bg-karima-brand/20" />
                    <a
                        href="mailto:hello@karimasyari.com"
                        className="text-[9px] uppercase tracking-[0.35em] text-karima-ink/40 hover:text-karima-accent transition-colors duration-300 font-medium"
                    >
                        Contact
                    </a>
                </div>

            </div>

            {/* Footer */}
            <div className="absolute bottom-6 left-0 right-0 text-center">
                <span className="text-[9px] uppercase tracking-[0.4em] text-karima-ink/25 font-medium">
                    © {new Date().getFullYear()} Karima — Modesty in Elegance
                </span>
            </div>
        </div>
    );
}
