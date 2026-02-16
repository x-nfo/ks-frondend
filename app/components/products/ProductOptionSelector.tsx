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
}

// Map color names to hex codes. 
// Ideally this would come from the backend, but for now we map manually.
const COLOR_MAP: Record<string, string> = {
    "black": "#000000",
    "white": "#FFFFFF",
    "off white": "#FAFAFA",
    "navy": "#000080",
    "blue": "#0000FF",
    "red": "#FF0000",
    "maroon": "#800000",
    "green": "#008000",
    "olive": "#808000",
    "beige": "#F5F5DC",
    "cream": "#FFFDD0",
    "brown": "#A52A2A",
    "grey": "#808080",
    "gray": "#808080",
    "silver": "#C0C0C0",
    "gold": "#FFD700",
    "pink": "#FFC0CB",
    "purple": "#800080",
    "lavender": "#E6E6FA",
    "jet black": "#0A0A0A",
    "midnight": "#191970",
};

export function ProductOptionSelector({
    optionGroups,
    selectedOptions,
    onChange,
    isOptionAvailable,
}: ProductOptionSelectorProps) {
    if (!optionGroups || optionGroups.length === 0) return null;

    // Sort groups so that Color always comes first
    const sortedGroups = [...optionGroups].sort((a, b) => {
        const isAColor = ["color", "shade", "colour"].includes(a.code.toLowerCase()) ||
            ["color", "shade", "colour"].includes(a.name.toLowerCase());
        const isBColor = ["color", "shade", "colour"].includes(b.code.toLowerCase()) ||
            ["color", "shade", "colour"].includes(b.name.toLowerCase());

        if (isAColor && !isBColor) return -1;
        if (!isAColor && isBColor) return 1;
        return 0;
    });

    return (
        <div className="space-y-6">
            {sortedGroups.map((group) => {
                const isColorGroup = ["color", "shade", "colour"].includes(group.code.toLowerCase()) ||
                    ["color", "shade", "colour"].includes(group.name.toLowerCase());

                return (
                    <div key={group.id} className="space-y-3">
                        <div className="flex justify-between items-baseline">
                            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-karima-brand">
                                {group.name}
                            </h4>
                            {selectedOptions[group.id] && (
                                <span className="text-[10px] uppercase tracking-[0.1em] text-karima-ink/40">
                                    {group.options.find(opt => opt.id === selectedOptions[group.id])?.name}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {group.options.map((option) => {
                                const isSelected = selectedOptions[group.id] === option.id;
                                const isAvailable = isOptionAvailable
                                    ? isOptionAvailable(group.id, option.id)
                                    : true;

                                if (isColorGroup) {
                                    const colorCode = COLOR_MAP[option.name.toLowerCase()] || option.name;
                                    const isWhite = colorCode.toLowerCase() === "#ffffff" || colorCode.toLowerCase() === "white";

                                    return (
                                        <button
                                            key={option.id}
                                            type="button"
                                            disabled={!isAvailable}
                                            onClick={() => onChange(group.id, option.id)}
                                            className={`
                                                w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                                                ${isSelected
                                                    ? "ring-1 ring-offset-3 ring-karima-brand scale-110"
                                                    : "hover:scale-105 hover:ring-2 hover:ring-offset-1 hover:ring-karima-brand/20"
                                                }
                                                ${!isAvailable ? "opacity-20 cursor-not-allowed grayscale" : ""}
                                            `}
                                            title={option.name}
                                        >
                                            <span
                                                className={`w-full h-full rounded-full border ${isWhite ? "border-stone-200" : "border-transparent"}`}
                                                style={{ backgroundColor: colorCode }}
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
                                        disabled={!isAvailable}
                                        onClick={() => onChange(group.id, option.id)}
                                        className={`
                                            relative min-w-[3rem] h-10 px-3 flex items-center justify-center 
                                            text-[11px] uppercase tracking-[0.1em] border transition-all duration-300
                                            ${isSelected
                                                ? isAvailable
                                                    ? "bg-karima-brand text-white border-karima-brand"
                                                    : "bg-stone-200 text-stone-400 border-stone-400 cursor-not-allowed"
                                                : isAvailable
                                                    ? "bg-transparent border-karima-brand/10 text-karima-ink hover:border-karima-brand/40"
                                                    : "bg-stone-200 border-stone-200 text-stone-400 cursor-not-allowed"
                                            }
                                        `}
                                    >
                                        <span className={!isAvailable ? "opacity-30" : ""}>{option.name}</span>
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
