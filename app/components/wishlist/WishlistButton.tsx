import { useNavigate } from "react-router";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

import { useState, useEffect, useCallback } from "react";

type WishlistButtonProps = {
    productVariantId: string;
    wishlistItemId?: string;
    isInWishlist?: boolean;
    className?: string;
};

export function WishlistButton({
    productVariantId,
    wishlistItemId,
    isInWishlist = false,
    className = "",
}: WishlistButtonProps) {
    const navigate = useNavigate();
    const [localInWishlist, setLocalInWishlist] = useState(isInWishlist);
    const [isBusy, setIsBusy] = useState(false);

    // Sync with server state only when the prop actually changes
    useEffect(() => {
        setLocalInWishlist(isInWishlist);
    }, [isInWishlist]);

    const toggleWishlist = useCallback(async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isBusy) return;

        const nextState = !localInWishlist;
        setLocalInWishlist(nextState);
        setIsBusy(true);

        try {
            const body = new URLSearchParams();
            body.append("action", nextState ? "add" : "remove");
            body.append("productVariantId", productVariantId);
            if (wishlistItemId && !nextState) {
                body.append("itemId", wishlistItemId);
            }
            body.append("_fetcher", "true");

            const res = await fetch("/api/wishlist", {
                method: "POST",
                body,
            });
            const data = await res.json();

            if (!data.success) {
                // Revert optimistic update
                setLocalInWishlist(!nextState);
                if (data.error === "auth_required") {
                    const redirectTo = encodeURIComponent(window.location.pathname);
                    navigate(`/sign-in?redirectTo=${redirectTo}`);
                }
            }
        } catch {
            // Revert optimistic update on network error
            setLocalInWishlist(!nextState);
        } finally {
            setIsBusy(false);
        }
    }, [isBusy, localInWishlist, productVariantId, wishlistItemId, navigate]);

    return (
        <button
            type="button"
            onClick={toggleWishlist}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${className} ${localInWishlist
                ? "bg-white text-karima-brand"
                : "bg-white/80 text-gray-400 hover:bg-white hover:text-karima-brand"
                } ${isBusy ? "opacity-70 cursor-wait" : ""}`}
            title={
                localInWishlist
                    ? "Remove from wishlist"
                    : "Add to favorites"
            }
        >
            {localInWishlist ? (
                <HeartIconSolid
                    className="h-5 w-5 flex-shrink-0"
                    aria-hidden="true"
                />
            ) : (
                <HeartIcon
                    className="h-5 w-5 flex-shrink-0"
                    aria-hidden="true"
                />
            )}
            <span className="sr-only">
                {localInWishlist
                    ? "Remove from wishlist"
                    : "Add to favorites"}
            </span>
        </button>
    );
}
