import { Link } from "react-router";
import { Price } from "../products/Price";
import { TrashIcon } from "@heroicons/react/24/outline";
import type { CurrencyCode } from "~/generated/graphql";
import { useState } from "react";

export interface WishlistItemProps {
  item: {
    id: string;
    productVariant: {
      id: string;
      name: string;
      priceWithTax: number;
      currencyCode: CurrencyCode;
      product: {
        id: string;
        slug: string;
        featuredAsset?: {
          preview: string;
        };
      };
    };
  };
  onRemoved?: (itemId: string) => void;
}

export function WishlistItem({ item, onRemoved }: WishlistItemProps) {
  const { productVariant } = item;
  const { product } = productVariant;
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    if (isRemoving) return;
    setIsRemoving(true);

    try {
      const body = new URLSearchParams();
      body.append("action", "remove");
      body.append("productVariantId", productVariant.id);
      body.append("_fetcher", "true");

      const res = await fetch("/api/wishlist", {
        method: "POST",
        body,
      });
      const data = await res.json();

      if (data.success) {
        onRemoved?.(item.id);
      }
    } catch {
      // silently fail
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div
      className={`flex items-center py-6 border-b border-karima-base last:border-0 group transition-opacity ${isRemoving ? "opacity-50" : ""}`}
    >
      <Link to={`/products/${product.slug}`} className="flex-shrink-0">
        <img
          src={product.featuredAsset?.preview + "?w=150&h=150&crop=at-max"}
          alt={productVariant.name}
          className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg bg-gray-100"
        />
      </Link>

      <div className="ml-4 sm:ml-6 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex justify-between">
            <Link
              to={`/products/${product.slug}`}
              className="text-lg font-medium text-karima-ink hover:text-karima-brand transition-colors"
            >
              {productVariant.name}
            </Link>
          </div>
          <div className="mt-1 text-lg font-semibold text-karima-ink">
            <Price
              priceWithTax={productVariant.priceWithTax}
              currencyCode={productVariant.currencyCode}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center space-x-4">
          <button
            type="button"
            onClick={handleRemove}
            disabled={isRemoving}
            className="flex items-center text-sm text-karima-accent hover:text-karima-brand transition-colors disabled:cursor-wait"
          >
            <TrashIcon className="w-4 h-4 mr-1" />
            Remove
          </button>

          <Link
            to={`/products/${product.slug}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-sm shadow-sm text-white bg-karima-brand hover:bg-karima-accent transition-colors"
          >
            Add to Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
