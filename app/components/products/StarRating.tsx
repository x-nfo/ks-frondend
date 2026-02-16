import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";

interface StarRatingProps {
    rating: number;
    count?: number;
    showCount?: boolean;
    className?: string; // Allow passing consistent styling classes
}

export function StarRating({ rating, count = 0, showCount = false, className = "" }: StarRatingProps) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="flex text-karima-brand">
                {[1, 2, 3, 4, 5].map((star) => (
                    rating >= star ? (
                        <StarIcon key={star} className="h-4 w-4" aria-hidden="true" />
                    ) : (
                        <StarOutlineIcon key={star} className="h-4 w-4 text-karima-brand/20" aria-hidden="true" />
                    )
                ))}
            </div>
            {showCount && count > 0 && (
                <span className="text-xs text-karima-brand/60">({count})</span>
            )}
        </div>
    );
}
