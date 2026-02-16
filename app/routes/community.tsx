import { Link } from "react-router";
import { ArrowLeft, Users, Heart, Share2 } from "lucide-react";

export default function Community() {
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
                    /> Back to Home
                </Link>
            </div>
            <div className="container mx-auto max-w-5xl px-6">
                <div className="text-center mb-16">
                    <span
                        className="text-xxs text-karima-accent uppercase tracking-[0.3em] font-medium block mb-4"
                    >Our Tribe</span>
                    <h1
                        className="text-4xl md:text-6xl font-serif text-karima-brand italic mb-8"
                    >
                        Karima Community
                    </h1>
                    <p
                        className="text-karima-ink/60 font-light max-w-2xl mx-auto leading-relaxed text-lg"
                    >
                        Connect with like-minded women who value modesty, elegance, and faith.
                        Share your style, your stories, and your journey with us.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-12 text-center mb-24">
                    <div className="p-8 border border-karima-brand/5 hover:border-karima-brand/20 transition-colors">
                        <div className="w-16 h-16 bg-karima-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 text-karima-gold">
                            <Users size={32} strokeWidth={1} />
                        </div>
                        <h3 className="font-serif text-2xl text-karima-brand italic mb-4">Events</h3>
                        <p className="text-karima-ink/70 font-light text-sm leading-relaxed">
                            Join exclusive gatherings, workshops, and intimate tea sessions designed to nurture our sisterhood.
                        </p>
                    </div>
                    <div className="p-8 border border-karima-brand/5 hover:border-karima-brand/20 transition-colors">
                        <div className="w-16 h-16 bg-karima-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 text-karima-gold">
                            <Heart size={32} strokeWidth={1} />
                        </div>
                        <h3 className="font-serif text-2xl text-karima-brand italic mb-4">Giving Back</h3>
                        <p className="text-karima-ink/70 font-light text-sm leading-relaxed">
                            Participate in our charitable initiatives. Every purchase contributes to education programs for underprivileged children.
                        </p>
                    </div>
                    <div className="p-8 border border-karima-brand/5 hover:border-karima-brand/20 transition-colors">
                        <div className="w-16 h-16 bg-karima-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 text-karima-gold">
                            <Share2 size={32} strokeWidth={1} />
                        </div>
                        <h3 className="font-serif text-2xl text-karima-brand italic mb-4">#KarimaWoman</h3>
                        <p className="text-karima-ink/70 font-light text-sm leading-relaxed">
                            Tag us in your photos for a chance to be featured on our journal and social platforms.
                        </p>
                    </div>
                </div>

                <div className="bg-karima-brand/5 p-12 md:p-20 text-center relative overflow-hidden">
                    <h2 className="text-3xl md:text-4xl font-serif text-karima-brand italic mb-6 relative z-10">
                        Join the Conversation
                    </h2>
                    <p className="text-karima-ink/70 font-light mb-8 max-w-lg mx-auto relative z-10">
                        Subscribe to our newsletter to receive invitations to upcoming community events.
                    </p>
                    <div className="max-w-md mx-auto relative z-10">
                        <div className="flex border-b border-karima-brand/20 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Your email address"
                                className="w-full bg-transparent py-4 text-karima-brand font-serif italic focus:outline-hidden placeholder:text-karima-brand/30"
                            />
                            <button className="text-xs uppercase tracking-widest text-karima-brand hover:text-karima-gold transition-colors whitespace-nowrap px-4">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
