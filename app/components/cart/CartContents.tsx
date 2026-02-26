import { Trash2 } from "lucide-react";
import { Form, Link } from "react-router";
import { Price } from "../products/Price";
import { CurrencyCode } from "../../generated/graphql";
import { getVariantImagePreview } from "../../utils/variant-image";

export function CartContents({
  orderLines,
  currencyCode,
  editable = true,
  adjustOrderLine,
  removeItem,
}: {
  orderLines: any[]; // activeOrder.lines
  currencyCode: CurrencyCode;
  editable: boolean;
  adjustOrderLine?: (lineId: string, quantity: number) => void;
  removeItem?: (lineId: string) => void;
}) {
  const isEditable = editable !== false;

  return (
    <div className="flow-root">
      <ul role="list" className="-my-6 divide-y divide-karima-brand/10">
        {(orderLines ?? []).map((line) => (
          <li key={line.id} className="py-6 flex">
            <div className="flex-shrink-0 w-24 border border-karima-brand/10 bg-gray-50 flex items-start justify-center">
              <img
                src={
                  (getVariantImagePreview(
                    line.productVariant,
                    line.featuredAsset
                  ) || "") + "?preset=thumb"
                }
                alt={line.productVariant.name}
                className="w-full h-auto object-contain"
              />
            </div>

            <div className="ml-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start text-base font-medium text-karima-ink">
                  <div className="flex flex-col">
                    <h3 className="uppercase tracking-widest font-sans text-sm">
                      <Link
                        to={`/products/${line.productVariant.product.slug}`}
                        className="hover:text-karima-brand transition-colors"
                      >
                        {line.productVariant.product.name}
                      </Link>
                    </h3>
                    <p className="mt-1 text-xs text-karima-ink/60 uppercase tracking-wider">
                      {line.productVariant.name}
                    </p>
                  </div>
                  <p className="ml-4 font-normal whitespace-nowrap">
                    <Price
                      priceWithTax={line.linePriceWithTax}
                      currencyCode={currencyCode}
                    />
                  </p>
                </div>
              </div>

              <div className="flex-1 flex items-end justify-between text-sm">
                {isEditable ? (
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center border border-karima-brand/10 rounded-sm bg-white">
                      <button
                        type="button"
                        onClick={() =>
                          adjustOrderLine &&
                          adjustOrderLine(
                            line.id,
                            Math.max(1, line.quantity - 1),
                          )
                        }
                        disabled={line.quantity <= 1}
                        className="px-3 py-1 text-karima-ink hover:text-karima-brand disabled:opacity-30 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <span className="text-sm font-medium">-</span>
                      </button>
                      <span className="w-6 text-center text-sm font-medium text-karima-ink">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          adjustOrderLine &&
                          adjustOrderLine(line.id, line.quantity + 1)
                        }
                        className="px-3 py-1 text-karima-ink hover:text-karima-brand transition-colors"
                        aria-label="Increase quantity"
                      >
                        <span className="text-sm font-medium">+</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem && removeItem(line.id)}
                      className="text-karima-ink/40 hover:text-rose-500 transition-colors"
                      aria-label="Remove"
                    >
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                ) : (
                  <div className="text-gray-800">
                    <span className="mr-1">Quantity</span>
                    <span className="font-medium">{line.quantity}</span>
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
