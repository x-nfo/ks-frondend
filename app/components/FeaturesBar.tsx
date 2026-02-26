export const FeaturesBar = () => {
  return (
    <div className="bg-white text-karima-brand py-6 border-t border-b border-karima-brand/10 relative z-10 w-full mt-32">
      <div className="container mx-auto px-6">
        <div className="flex lg:grid lg:grid-cols-4 gap-8 lg:gap-8 overflow-x-auto lg:overflow-visible no-scrollbar hide-scrollbar items-center snap-x snap-mandatory px-2">
          {/* Best-in-Class Materials */}
          <div className="flex flex-row items-center justify-start text-left gap-3 shrink-0 w-auto pr-8 snap-start group cursor-pointer">
            <div className="text-karima-gold shrink-0 transition-transform group-hover:scale-110 duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
              </svg>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] uppercase tracking-[0.15em] font-medium text-karima-brand leading-tight lg:text-[10px] lg:tracking-[0.2em] whitespace-nowrap group-hover:text-karima-gold transition-colors">
                Best-in-Class Materials
              </span>
              <span className="text-[9px] text-karima-ink/50 font-serif italic hidden lg:block group-hover:text-karima-ink/70">
                Sourced efficiently
              </span>
            </div>
          </div>

          {/* Loyalty Point Rewards */}
          <div className="flex flex-row items-center justify-start text-left gap-3 shrink-0 w-auto pr-8 snap-start group cursor-pointer">
            <div className="text-karima-gold shrink-0 transition-transform group-hover:scale-110 duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] uppercase tracking-[0.15em] font-medium text-karima-brand leading-tight lg:text-[10px] lg:tracking-[0.2em] whitespace-nowrap group-hover:text-karima-gold transition-colors">
                Loyalty Point Rewards
              </span>
              <span className="text-[9px] text-karima-ink/50 font-serif italic hidden lg:block group-hover:text-karima-ink/70">
                Earn as you shop
              </span>
            </div>
          </div>

          {/* Worldwide Shipping */}
          <div className="flex flex-row items-center justify-start text-left gap-3 shrink-0 w-auto pr-8 snap-start group cursor-pointer">
            <div className="text-karima-gold shrink-0 transition-transform group-hover:scale-110 duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                <path d="M2 12h20"></path>
              </svg>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] uppercase tracking-[0.15em] font-medium text-karima-brand leading-tight lg:text-[10px] lg:tracking-[0.2em] whitespace-nowrap group-hover:text-karima-gold transition-colors">
                Worldwide Shipping
              </span>
              <span className="text-[9px] text-karima-ink/50 font-serif italic hidden lg:block group-hover:text-karima-ink/70">
                Global delivery
              </span>
            </div>
          </div>

          {/* Multiple Payment Options */}
          <div className="flex flex-row items-center justify-start text-left gap-3 shrink-0 w-auto pr-8 snap-start group cursor-pointer">
            <div className="text-karima-gold shrink-0 transition-transform group-hover:scale-110 duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                <line x1="2" x2="22" y1="10" y2="10"></line>
              </svg>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] uppercase tracking-[0.15em] font-medium text-karima-brand leading-tight lg:text-[10px] lg:tracking-[0.2em] whitespace-nowrap group-hover:text-karima-gold transition-colors">
                Multiple Payment Options
              </span>
              <span className="text-[9px] text-karima-ink/50 font-serif italic hidden lg:block group-hover:text-karima-ink/70">
                Secure checkout
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
