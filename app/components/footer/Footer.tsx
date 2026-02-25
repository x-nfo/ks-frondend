import { Link } from "react-router";
import FooterSection from "./FooterSection";

export default function Footer() {
    const informationLinks = [
        { label: "Our Story", href: "/about" },
        { label: "Community", href: "/community" },
        { label: "Highlights & Launches", href: "/highlights" },
        { label: "Journal", href: "/blog" },
    ];

    const supportLinks = [
        { label: "Shipping Policy", href: "/shipping" },
        { label: "Returns & Exchanges", href: "/returns" },
        { label: "Size Guide", href: "/size-guide" },
        { label: "FAQ", href: "/faq" },
        { label: "Contact Us", href: "/contact" },
    ];

    const legalLinks = [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
    ];

    return (
        <footer className="bg-karima-brand text-karima-base pt-32 pb-12 px-6 border-t border-white/5 relative overflow-hidden">
            {/* Background Text Effect */}
            <div className="container mx-auto max-w-7xl relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-y-12 md:gap-x-12 lg:gap-x-24 mb-12 md:mb-24">
                    {/* Brand Column */}
                    <div className="md:col-span-4 lg:col-span-5 space-y-10 mb-10 md:mb-0">
                        <h2 className="text-4xl font-quiche text-white">
                            Karima
                        </h2>
                        <p className="text-sm font-light leading-relaxed opacity-60 max-w-sm tracking-wide">
                            Redefining modest fashion with timeless elegance. Each piece is a
                            testament to modern woman's grace, crafted in Jakarta using finest
                            Medina Silk.
                        </p>
                        <div className="flex gap-8 opacity-50 text-[10px] uppercase tracking-widest">
                            <a href="https://www.instagram.com/karima.syari/" className="hover:text-white transition-colors">Instagram</a>
                        </div>
                    </div>

                    {/* Information Column */}
                    <div className="md:col-span-2 lg:col-span-2">
                        <FooterSection title="Information" links={informationLinks} id="footer-info" />
                    </div>

                    {/* Customer Support Column */}
                    <div className="md:col-span-3 lg:col-span-3">
                        <FooterSection title="Customer Support" links={supportLinks} id="footer-support" />
                    </div>

                    {/* Legal Column */}
                    <div className="md:col-span-3 lg:col-span-2">
                        <FooterSection title="Legal" links={legalLinks} id="footer-legal" />
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase tracking-[0.2em] opacity-30">
                    <p>© 2026 KARIMA OFFICIAL.</p>
                    <p>Jakarta, Indonesia</p>
                </div>
            </div>
        </footer>
    );
}
