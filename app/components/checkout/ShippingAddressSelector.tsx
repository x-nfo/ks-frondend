import { Radio, RadioGroup } from "@headlessui/react";
import { clsx } from "clsx";
import { CheckCircleIcon, MapPinIcon } from "@heroicons/react/24/solid";

interface Address {
  id: string;
  fullName?: string | null;
  streetLine1: string;
  streetLine2?: string | null;
  city: string;
  province: string;
  postalCode: string;
  country: {
    name: string;
  };
}

export function ShippingAddressSelector({
  addresses,
  selectedAddressIndex,
  onChange,
}: {
  addresses: Address[];
  selectedAddressIndex: number;
  onChange: (value: number) => void;
}) {
  return (
    <RadioGroup
      value={selectedAddressIndex}
      onChange={onChange}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(addresses || []).map((address, index) => (
          <Radio
            key={index}
            value={index}
            className={({ checked }) =>
              clsx(
                checked
                  ? "border-karima-brand bg-karima-brand/5"
                  : "border-gray-200 bg-white",
                "relative border-2 rounded-none p-5 flex cursor-pointer focus:outline-none hover:border-karima-brand/40 transition-all group",
              )
            }
          >
            {({ checked }) => (
              <>
                <div className="flex w-full items-start gap-3">
                  <div
                    className={clsx(
                      "p-2 rounded-lg flex-shrink-0 transition-colors",
                      checked
                        ? "bg-karima-brand/10 text-karima-brand"
                        : "bg-gray-100 text-gray-400 group-hover:bg-gray-200",
                    )}
                  >
                    <MapPinIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <span
                        className={clsx(
                          "block text-sm font-bold text-karima-ink leading-tight truncate pr-4 font-sans",
                          checked ? "text-karima-brand" : "",
                        )}
                      >
                        {address.fullName || address.streetLine1}
                      </span>
                      {checked && (
                        <CheckCircleIcon
                          className="h-5 w-5 text-karima-brand flex-shrink-0"
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    <div className="text-xs text-karima-ink/60 space-y-1 font-medium font-sans">
                      <p className="font-medium">{address.streetLine1}</p>
                      {address.streetLine2 && <p>{address.streetLine2}</p>}
                      <p>
                        {address.city}, {address.province}
                      </p>
                      <p>
                        {address.postalCode}, {address.country.name}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </Radio>
        ))}
      </div>
    </RadioGroup>
  );
}
