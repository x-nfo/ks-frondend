import { useState, useEffect } from "react";
import { Check } from "lucide-react";

export interface Option {
  id: string;
  name: string;
  code: string;
}

export interface OptionGroup {
  id: string;
  name: string;
  code: string;
  options: Option[];
}

export interface ProductOptionSelectorProps {
  optionGroups: OptionGroup[];
  selectedOptions: Record<string, string>;
  onChange: (groupId: string, optionId: string) => void;
  isOptionAvailable?: (groupId: string, optionId: string) => boolean;
  onOpenSizeGuide?: () => void;
  hasSizeGuide?: boolean;
}

// Map color names to hex codes.
// Ideally this would come from the backend, but for now we map manually.
const COLOR_MAP: Record<string, string> = {
  black: "#000000",
  white: "#FFFFFF",
  "off white": "#FAFAFA",
  navy: "#000080",
  blue: "#0000FF",
  red: "#FF0000",
  maroon: "#800000",
  green: "#008000",
  olive: "#808000",
  beige: "#F5F5DC",
  cream: "#FFFDD0",
  brown: "#A52A2A",
  grey: "#808080",
  gray: "#808080",
  silver: "#C0C0C0",
  gold: "#FFD700",
  pink: "#FFC0CB",
  purple: "#800080",
  lavender: "#E6E6FA",
  "jet black": "#0A0A0A",
  midnight: "#191970",
};

export function ProductOptionSelector({
  optionGroups,
  selectedOptions,
  onChange,
  isOptionAvailable,
  onOpenSizeGuide,
  hasSizeGuide = false,
}: ProductOptionSelectorProps) {
  if (!optionGroups || optionGroups.length === 0) return null;

  // Sort groups so that Color always comes first
  const sortedGroups = [...optionGroups].sort((a, b) => {
    const isAColor =
      ["color", "shade", "colour"].includes(a.code.toLowerCase()) ||
      ["color", "shade", "colour"].includes(a.name.toLowerCase());
    const isBColor =
      ["color", "shade", "colour"].includes(b.code.toLowerCase()) ||
      ["color", "shade", "colour"].includes(b.name.toLowerCase());

    if (isAColor && !isBColor) return -1;
    if (!isAColor && isBColor) return 1;
    return 0;
  });

  return (
    <div className="space-y-6">
      {sortedGroups.map((group) => {
        const isColorGroup =
          ["color", "shade", "colour"].includes(group.code.toLowerCase()) ||
          ["color", "shade", "colour"].includes(group.name.toLowerCase());

        return (
          <div key={group.id} className="space-y-3">
            <div className="flex justify-between items-baseline mb-3">
              <div className="flex items-center gap-2">
                <h4 className="text-[10px] uppercase tracking-[0.3em] font-medium text-karima-ink/40">
                  Select {group.name}
                </h4>
                {selectedOptions[group.id] && (
                  <span className="text-[10px] uppercase tracking-[0.1em] text-karima-ink/40">
                    {
                      group.options.find(
                        (opt) => opt.id === selectedOptions[group.id],
                      )?.name
                    }
                  </span>
                )}
              </div>
              {group.name.toLowerCase() === "size" && hasSizeGuide && (
                <button
                  type="button"
                  onClick={onOpenSizeGuide}
                  className="flex items-center gap-1.5 text-karima-brand/70 hover:text-karima-brand transition-colors"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transform rotate-45"
                  >
                    <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                    <line x1="6" y1="6" x2="6" y2="10"></line>
                    <line x1="10" y1="6" x2="10" y2="10"></line>
                    <line x1="14" y1="6" x2="14" y2="10"></line>
                    <line x1="18" y1="6" x2="18" y2="10"></line>
                  </svg>
                  <span className="text-[11px] font-sans font-light tracking-wide">
                    Size Guide
                  </span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {group.options.map((option) => {
                const isSelected = selectedOptions[group.id] === option.id;
                const isAvailable = isOptionAvailable
                  ? isOptionAvailable(group.id, option.id)
                  : true;

                if (isColorGroup) {
                  // Resolve color(s) from name or code
                  // Handles single color ("black") or bicolor ("black/beige" or "black-beige")
                  const getColors = (name: string, code: string): string[] => {
                    // Try to find a separator in either name or code
                    const searchStr = `${name}|${code}`;
                    const separator = searchStr.includes("/") ? "/" : searchStr.includes("-") ? "-" : null;

                    if (separator) {
                      // Use the string that actually contains the separator
                      const target = (name.includes(separator) ? name : code).split(separator);
                      return target.map(n => {
                        const trimmed = n.trim().toLowerCase();
                        return COLOR_MAP[trimmed] || trimmed;
                      });
                    }
                    return [COLOR_MAP[name.toLowerCase()] || code || name];
                  };

                  const colors = getColors(option.name, option.code);
                  console.log(`[Color Debug] Option: ${option.name}, Code: ${option.code}, Resolved Colors:`, colors);
                  const isBicolor = colors.length >= 2;
                  const primaryColor = colors[0];
                  const secondaryColor = colors[1] || colors[0];

                  const isWhite =
                    primaryColor.toLowerCase() === "#ffffff" ||
                    primaryColor.toLowerCase() === "white";

                  const swatchStyle = isBicolor
                    ? { background: `linear-gradient(90deg, ${primaryColor} 50%, ${secondaryColor} 50%)` }
                    : { backgroundColor: primaryColor };

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => onChange(group.id, option.id)}
                      className={`
                                                relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                                                ${isSelected
                          ? "ring-1 ring-offset-3 ring-karima-brand scale-110"
                          : "hover:scale-105 hover:ring-2 hover:ring-offset-1 hover:ring-karima-brand/20"
                        }
                                                ${!isAvailable ? "opacity-40" : ""}
                                            `}
                      title={option.name}
                    >
                      <span
                        className={`w-full h-full rounded-full border ${isWhite ? "border-stone-200" : "border-transparent"}`}
                        style={swatchStyle}
                      />
                      {!isAvailable && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-[1px] bg-stone-400 -rotate-45"></div>
                        </div>
                      )}
                    </button>
                  );
                }

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onChange(group.id, option.id)}
                    className={`
                                            relative min-w-[3rem] h-10 px-3 flex items-center justify-center 
                                            text-[11px] uppercase tracking-[0.1em] border
                                            ${isSelected
                        ? isAvailable
                          ? "bg-karima-brand text-white border-karima-brand"
                          : "bg-karima-brand/40 text-white border-karima-brand/40"
                        : isAvailable
                          ? "bg-transparent border-karima-brand/10 text-karima-ink hover:border-karima-brand/40"
                          : "bg-stone-100 border-stone-200 text-stone-400"
                      }
                                        `}
                  >
                    <span className={!isAvailable ? "opacity-30" : ""}>
                      {option.name}
                    </span>
                    {!isAvailable && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-[1px] bg-stone-400/50 -rotate-45 transform scale-x-110"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
