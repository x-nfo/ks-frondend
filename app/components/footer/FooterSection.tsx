import { useState } from "react";
import { Link } from "react-router";

interface FooterLink {
    label: string;
    href: string;
}

interface FooterSectionProps {
    title: string;
    links: FooterLink[];
    id: string;
}

export default function FooterSection({ title, links, id }: FooterSectionProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-white/5 md:border-none last:border-0">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center py-4 md:py-0 md:bg-transparent text-left group cursor-pointer"
                aria-expanded={isOpen}
                aria-controls={`${id}-content`}
            >
                <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-karima-gold opacity-80 group-hover:text-karima-gold transition-colors">
                    {title}
                </h3>
                <svg
                    className={`w-4 h-4 text-karima-gold transition-transform duration-300 md:hidden opacity-60 ${isOpen ? "rotate-180" : ""
                        }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1"
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>
            <div
                id={`${id}-content`}
                className={`overflow-hidden transition-all duration-500 ease-in-out md:max-h-none md:opacity-100 md:overflow-visible md:mt-8 ${isOpen ? "max-h-[500px] opacity-100 mt-4 pb-6" : "max-h-0 opacity-0 mt-0 pb-0"
                    }`}
            >
                <ul className="space-y-4 text-xs font-light opacity-60 uppercase tracking-widest pt-2 md:pt-0">
                    {links.map((link) => (
                        <li key={link.href}>
                            <Link
                                to={link.href}
                                className="hover:text-white hover:opacity-100 transition-all"
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
