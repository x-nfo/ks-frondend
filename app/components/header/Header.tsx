import { Link, useLocation } from "react-router";
import { ShoppingBag, User, Search, Heart, Menu, X, ArrowRight, Instagram, Facebook, Youtube } from "lucide-react";
import { useState, useEffect } from "react";
import { useRootLoader } from "../../utils/use-root-loader";
import { SearchBar } from "./SearchBar";
import { classNames } from "../../utils/class-names";

export function Header({
    onCartIconClick,
    cartQuantity,
}: {
    onCartIconClick: () => void;
    cartQuantity: number;
}) {
    const data = useRootLoader();
    const isSignedIn = !!(data && data.activeCustomer && data.activeCustomer.activeCustomer?.id);
    // Potential TODO: Get real wishlist count if available in data.activeCustomer
    const wishlistCount = 0;

    const [isScrolled, setIsScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    // Check if on product page for transparency logic (from Astro)
    // In Astro: const hideNavbar = isProductPage && !isScrolled;
    // We'll adapt this logic.
    const isHome = location.pathname === "/";
    const isProductPage = location.pathname.startsWith("/products/"); // Remix route is likely /products/

    useEffect(() => {
        const handleScroll = () => {
            const threshold = isProductPage ? window.innerHeight * 0.7 : 50;
            setIsScrolled(window.scrollY > threshold);
        };

        window.addEventListener("scroll", handleScroll);
        // Check initial scroll
        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, [isProductPage]);

    // Derived styles based on state
    // Dark text logic: const useDarkText = isScrolled || !isHome;
    const useDarkText = isScrolled || !isHome;

    const getResponsiveColor = (darkInfo: string, lightInfo: string) => {
        return useDarkText ? darkInfo : lightInfo;
    };

    const textColorClass = getResponsiveColor("text-karima-ink", "text-karima-base");
    const logoColorClass = getResponsiveColor("text-karima-brand", "text-karima-base");
    const bgLinkHover = getResponsiveColor("bg-karima-brand", "bg-karima-base");
    const accentColorClass = getResponsiveColor("text-karima-accent", "text-karima-base/70");
    const cartBadgeBg = getResponsiveColor("bg-black", "bg-white");
    const cartBadgeText = getResponsiveColor("text-white", "text-black");

    const navLinkClass = `relative text-xs uppercase tracking-[0.2em] font-medium ${textColorClass} hover:opacity-70 group py-4`;
    const navUnderlineClass = `absolute bottom-3 left-0 w-0 h-[1px] ${bgLinkHover} group-hover:w-full opacity-50`;

    const handleMobileNav = (path: string) => {
        // close menu then navigate - handled by Link naturally, but we need to close menu
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            {/* Top Ticker */}
            <div className="hidden lg:block bg-karima-brand text-karima-base text-[10px] tracking-[0.15em] uppercase font-medium py-2 text-center absolute w-full z-[1001] top-0">
                <span>Complimentary Global Shipping on Orders Over Rp 3.000.000</span>
            </div>

            {/* Main Nav */}
            <header
                className={classNames(
                    "fixed left-0 w-full z-[1000] border-b lg:top-0 top-0",
                    "translate-y-0 opacity-100",
                    isScrolled ? "bg-white/80 backdrop-blur-md border-karima-brand/1 py-2 shadow-sm" : "bg-white/5 backdrop-blur-sm border-white/10 py-6 lg:pt-12 lg:pb-8"
                )}
            >
                <div className="container mx-auto px-6 md:px-12 max-w-7xl flex items-center justify-between">
                    {/* Left Nav */}
                    <nav className="hidden lg:flex items-center gap-10 flex-1 justify-start">
                        <Link to="/collections/all" className={navLinkClass}>
                            Collections <span className={navUnderlineClass}></span>
                        </Link>
                        <Link to="/collections/new-in" className={navLinkClass}>
                            New In <span className={navUnderlineClass}></span>
                        </Link>
                        <Link to="/about" className={navLinkClass}>
                            Atelier <span className={navUnderlineClass}></span>
                        </Link>
                        <Link to="/blog" className={navLinkClass}>
                            Journal <span className={navUnderlineClass}></span>
                        </Link>
                    </nav>

                    {/* Center Logo */}
                    <Link to="/" className="flex-shrink-0 cursor-pointer text-center group z-10 relative">
                        <h1 className={`font-serif font-medium tracking-tight ${logoColorClass} ${isScrolled ? "text-2xl lg:text-3xl" : "text-3xl lg:text-5xl"}`}>
                            Karima
                        </h1>
                        <span className={`text-[10px] ${accentColorClass} hidden lg:block mt-1 font-serif italic tracking-wider ${isScrolled ? "opacity-0 h-0 overflow-hidden" : "opacity-100 h-auto"}`}>
                            Faithfully Beautiful
                        </span>
                    </Link>

                    {/* Right Icons */}
                    <div className={`flex items-center gap-6 md:gap-8 flex-1 justify-end ${textColorClass}`}>
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="hover:opacity-60 transition-opacity hidden sm:block"
                            aria-label="Search"
                        >
                            <Search size={20} strokeWidth={2} />
                        </button>

                        <Link
                            to={isSignedIn ? "/account" : "/sign-in"}
                            className="hover:opacity-60 transition-opacity hidden sm:block"
                            aria-label="Account"
                        >
                            <User size={20} strokeWidth={2} />
                        </Link>

                        <Link
                            to="/account/wishlist"
                            className="relative hover:opacity-60 transition-opacity"
                            aria-label="Wishlist"
                        >
                            <Heart size={20} strokeWidth={2} />
                            {wishlistCount > 0 && (
                                <span className={`absolute -top-2 -right-2 ${cartBadgeBg} ${cartBadgeText} text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-serif italic`}>
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>

                        <button
                            onClick={onCartIconClick}
                            className="relative hover:opacity-60"
                            aria-label="Cart"
                        >
                            <ShoppingBag size={20} strokeWidth={1.5} />
                            {cartQuantity > 0 && (
                                <span className={`absolute -top-2 -right-2 ${cartBadgeBg} ${cartBadgeText} text-[10px] w-5 h-5 flex items-center justify-center rounded-full`}>
                                    {cartQuantity}
                                </span>
                            )}
                        </button>

                        <button
                            className="lg:hidden ml-2 z-50 relative"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Menu"
                        >
                            {isMobileMenuOpen ? <X size={24} strokeWidth={2} className="text-karima-brand" /> : <Menu size={24} strokeWidth={2} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu - Off-Canvas Slide from Left (Full Screen) */}
            <div className={`fixed inset-0 h-[100dvh] bg-karima-base z-[900] flex flex-col ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
                {/* Header Spacer for Close Button Alignment */}
                <div className="w-full h-24"></div>

                {/* Menu Items */}
                <div className="flex flex-col gap-10 pl-8 md:pl-12 pt-4 overflow-y-auto pb-32">
                    {/* Main Links */}
                    <div className="flex flex-col gap-6 text-left">
                        {[
                            { label: "New Arrivals", path: "/collections/new-in" },
                            { label: "Abayas", path: "/collections/abayas" },
                            { label: "Khimars", path: "/collections/khimars" },
                            { label: "Atelier", path: "/about" },
                            { label: "Journal", path: "/blog" }
                        ].map((item, idx) => (
                            <Link
                                key={idx}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`group flex items-center gap-4 text-3xl md:text-4xl font-serif transform ${isMobileMenuOpen ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"}`}
                            >
                                <span className="group-hover:text-karima-gold text-karima-brand">{item.label}</span>
                                <ArrowRight size={24} strokeWidth={0.5} className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 text-karima-gold" />
                            </Link>
                        ))}
                    </div>

                    {/* Secondary Links */}
                    {isMobileMenuOpen && (
                        <div className="flex flex-col gap-4 text-left border-t border-karima-brand/10 pt-10 mr-12">
                            <Link to="/account" onClick={() => setIsMobileMenuOpen(false)} className="text-karima-ink/60 hover:text-karima-brand uppercase tracking-[0.15em] text-xs font-medium text-left">
                                My Account
                            </Link>
                            <Link to="/account/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="text-karima-ink/60 hover:text-karima-brand uppercase tracking-[0.15em] text-xs font-medium text-left">
                                Wishlist
                            </Link>
                            <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-karima-ink/60 hover:text-karima-brand uppercase tracking-[0.15em] text-xs font-medium text-left">
                                Customer Care
                            </Link>
                        </div>
                    )}

                    {/* Social Media Icons */}
                    {isMobileMenuOpen && (
                        <div className="flex items-center gap-8 mt-4">
                            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-karima-brand hover:text-karima-gold transition-colors">
                                <Instagram size={20} strokeWidth={1} />
                            </a>
                            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-karima-brand hover:text-karima-gold transition-colors">
                                <Facebook size={20} strokeWidth={1} />
                            </a>
                            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-karima-brand hover:text-karima-gold transition-colors">
                                <Youtube size={20} strokeWidth={1} />
                            </a>
                        </div>
                    )}
                </div>

                <div
                    className={`absolute bottom-8 left-8 md:left-12 text-karima-accent text-[10px] uppercase tracking-[0.3em] ${isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                >
                    Karima Official Store
                </div>
            </div>


            {/* Karima Search Overlay */}
            {searchOpen && (
                <div className="fixed inset-0 z-[100] bg-white/98 backdrop-blur-2xl p-12 flex flex-col">
                    <div className="flex justify-end">
                        <button
                            onClick={() => setSearchOpen(false)}
                            className="bg-karima-brand/5 p-4 rounded-full text-karima-brand hover:rotate-90"
                        >
                            <X size={32} strokeWidth={1} />
                        </button>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="w-full max-w-4xl relative">
                            <SearchBar onSelect={() => setSearchOpen(false)} />
                            <p className="mt-8 text-center text-[10px] uppercase tracking-[0.4em] text-karima-ink/30 font-medium">
                                Press esc to close
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// Add animation styles if not present in app.css or reuse existing ones
