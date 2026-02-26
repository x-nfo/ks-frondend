import { X } from "lucide-react";

export interface Filters {
  category: string[];
  colors: string[];
  minPrice: number;
  maxPrice: number;
}

interface FilterSidebarProps {
  isOpen: boolean;
  filters: Filters;
  availableCategories: string[];
  availableColors: { name: string; hex: string }[];
  minPriceLimit: number;
  maxPriceLimit: number;
  onUpdateFilters: (filters: Filters) => void;
  onClearFilters: () => void;
  onClose: () => void;
}

export function FilterSidebar({
  isOpen,
  filters,
  availableCategories,
  availableColors,
  minPriceLimit,
  maxPriceLimit,
  onUpdateFilters,
  onClearFilters,
  onClose,
}: FilterSidebarProps) {
  const toggleCategory = (cat: string) => {
    onUpdateFilters({
      ...filters,
      category: filters.category.includes(cat)
        ? filters.category.filter((c) => c !== cat)
        : [...filters.category, cat],
    });
  };

  const toggleColor = (hex: string) => {
    onUpdateFilters({
      ...filters,
      colors: filters.colors.includes(hex)
        ? filters.colors.filter((c) => c !== hex)
        : [...filters.colors, hex],
    });
  };

  const updateMaxPrice = (value: number) => {
    onUpdateFilters({
      ...filters,
      minPrice: 0,
      maxPrice: value,
    });
  };

  return (
    <div>
      {/* Backdrop for Mobile */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] transition-opacity duration-500 lg:hidden ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <div
        className={`bg-white border-r border-karima-brand/5 shadow-2xl transition-transform duration-500 fixed inset-y-0 left-0 z-[2001] w-[85vw] md:w-[320px] lg:relative lg:inset-auto lg:z-auto lg:w-full lg:h-auto lg:shadow-none lg:border-none lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex flex-col h-full bg-white lg:bg-transparent">
          {/* Header (Mobile Only) */}
          <div className="flex items-center justify-between p-6 lg:hidden border-b border-karima-brand/10">
            <h3 className="text-xl font-serif text-karima-brand">Filters</h3>
            <button onClick={onClose}>
              <X size={24} className="text-karima-brand" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 lg:p-0 space-y-12 no-scrollbar">
            {/* Categories */}
            {availableCategories.length > 0 && (
              <div>
                <h4 className="font-serif text-lg text-karima-brand mb-6 italic">
                  Category
                </h4>
                <div className="space-y-4">
                  {availableCategories.map((cat: string) => (
                    <label
                      key={cat}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div
                        className={`w-4 h-4 border border-karima-brand/30 flex items-center justify-center transition-all ${filters.category.includes(cat) ? "bg-karima-brand border-karima-brand" : "group-hover:border-karima-brand"}`}
                      >
                        {filters.category.includes(cat) && (
                          <div className="w-2 h-2 bg-white" />
                        )}
                      </div>
                      <span
                        className={`text-micro uppercase tracking-widest transition-colors ${filters.category.includes(cat) ? "text-karima-brand font-medium" : "text-karima-ink/60 group-hover:text-karima-brand"}`}
                      >
                        {cat}
                      </span>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={filters.category.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range */}
            <div>
              <h4 className="font-serif text-lg text-karima-brand mb-6 italic">
                Price Range
              </h4>
              <div className="space-y-4">
                <input
                  type="range"
                  min={minPriceLimit}
                  max={maxPriceLimit}
                  step={Math.max(
                    1,
                    Math.round((maxPriceLimit - minPriceLimit) / 100),
                  )}
                  value={Math.min(
                    maxPriceLimit,
                    Math.max(minPriceLimit, filters.maxPrice || maxPriceLimit),
                  )}
                  onChange={(e) => updateMaxPrice(Number(e.target.value))}
                  className="w-full h-1 bg-karima-brand/10 rounded-lg appearance-none cursor-pointer accent-karima-brand"
                />
                <div className="flex justify-between text-micro font-serif text-karima-brand italic">
                  <span>Rp {minPriceLimit.toLocaleString("id-ID")}</span>
                  <span>
                    Rp{" "}
                    {Math.min(
                      maxPriceLimit,
                      filters.maxPrice || maxPriceLimit,
                    ).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            {/* Colors */}
            {availableColors.length > 0 && (
              <div>
                <h4 className="font-serif text-lg text-karima-brand mb-6 italic">
                  Colors
                </h4>
                <div className="flex flex-wrap gap-3">
                  {availableColors.map((col: { name: string; hex: string }) => (
                    <button
                      key={col.hex}
                      onClick={() => toggleColor(col.hex)}
                      className={`w-8 h-8 rounded-full border transition-all duration-300 relative ${filters.colors.includes(col.hex) ? "border-karima-brand scale-110" : "border-black/10 hover:scale-110"}`}
                      style={{ backgroundColor: col.hex }}
                      title={col.name}
                    >
                      {filters.colors.includes(col.hex) && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-8 border-t border-karima-brand/5 mt-auto">
            <button
              onClick={onClearFilters}
              className="w-full text-micro uppercase tracking-[0.25em] text-karima-ink/40 hover:text-karima-brand transition-colors mb-4 text-center block"
            >
              Clear All Filters
            </button>
            <button
              onClick={onClose}
              className="w-full bg-karima-brand text-white py-4 text-xs uppercase tracking-widest hover:bg-karima-ink transition-colors lg:hidden"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
