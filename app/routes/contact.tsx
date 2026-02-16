import { Link } from "react-router";
import ContactForm from "../components/ContactForm";
import { Mail, MapPin, Instagram, Clock, ArrowLeft } from "lucide-react";

export default function Contact() {
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
            <div className="container mx-auto max-w-6xl px-6">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-32">
                    {/* Contact Info */}
                    <div>
                        <span
                            className="text-xxs text-karima-accent uppercase tracking-[0.3em] font-medium block mb-4"
                        >Contact Us</span>
                        <h1
                            className="text-5xl md:text-7xl font-serif text-karima-brand italic mb-8"
                        >
                            Get in Touch
                        </h1>
                        <p
                            className="text-karima-ink/60 font-light leading-relaxed mb-12 max-w-md"
                        >
                            We are at your disposal to answer any questions about
                            our creations or to assist you with your order.
                        </p>

                        <div className="space-y-10">
                            <div>
                                <h3
                                    className="text-xs uppercase tracking-widest text-karima-brand mb-4 flex items-center gap-2"
                                >
                                    <Mail size={14} /> Email
                                </h3>
                                <a
                                    href="mailto:info@karima.com"
                                    className="text-xl font-serif italic text-karima-ink hover:text-karima-gold transition-colors"
                                >
                                    info@karima.com
                                </a>
                                <div
                                    className="mt-1 text-sm text-karima-ink/40 font-light"
                                >
                                    Response within 24 hours
                                </div>
                            </div>

                            <div>
                                <h3
                                    className="text-xs uppercase tracking-widest text-karima-brand mb-4 flex items-center gap-2"
                                >
                                    <Instagram size={14} /> Social
                                </h3>
                                <a
                                    href="https://instagram.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xl font-serif italic text-karima-ink hover:text-karima-gold transition-colors"
                                >
                                    @karima_official
                                </a>
                            </div>

                            <div>
                                <h3
                                    className="text-xs uppercase tracking-widest text-karima-brand mb-4 flex items-center gap-2"
                                >
                                    <MapPin size={14} /> Atelier
                                </h3>
                                <div
                                    className="text-lg font-light text-karima-ink/80 leading-relaxed"
                                >
                                    Jl. Senopati No. 45<br />
                                    Kebayoran Baru, Jakarta Selatan<br />
                                    Indonesia 12190
                                </div>
                            </div>

                            <div>
                                <h3
                                    className="text-xs uppercase tracking-widest text-karima-brand mb-4 flex items-center gap-2"
                                >
                                    <Clock size={14} /> Hours
                                </h3>
                                <div
                                    className="text-lg font-light text-karima-ink/80 leading-relaxed"
                                >
                                    Monday - Saturday<br />
                                    10:00 AM - 7:00 PM WIB
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <ContactForm />
                </div>
            </div>
        </div>
    );
}
