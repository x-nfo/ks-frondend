import { useState, useEffect } from 'react';
import type { AvailableCountriesQuery, OrderAddress } from '~/generated/graphql';
import { DestinationSelector } from '../checkout/DestinationSelector';
import { useRajaOngkir } from '~/hooks/useRajaOngkir';
import { clsx } from 'clsx';
import { FloatingLabelInput } from '../checkout/FloatingLabelInput';


export function AddressForm({
  address,
  defaultFullName,
  availableCountries,
}: {
  address?: OrderAddress | null;
  defaultFullName?: string;
  availableCountries?: AvailableCountriesQuery['availableCountries'];
}) {
  const { searchDestinations } = useRajaOngkir();
  const [city, setCity] = useState(address?.city ?? '');
  const [province, setProvince] = useState(address?.province ?? '');
  const [postalCode, setPostalCode] = useState(address?.postalCode ?? '');
  const [destinationId, setDestinationId] = useState<string | number>(
    (address as any)?.customFields?.rajaOngkirDestinationId ?? ''
  );

  // Update internal state if prop changes
  useEffect(() => {
    setCity(address?.city ?? '');
    setProvince(address?.province ?? '');
    setPostalCode(address?.postalCode ?? '');
    setDestinationId((address as any)?.customFields?.rajaOngkirDestinationId ?? '');
  }, [address]);

  const handleDestinationSelect = (destination: any) => {
    if (destination) {
      setCity(destination.cityName || '');
      setProvince(destination.provinceName || '');
      setPostalCode(destination.zipCode || '');
      setDestinationId(destination.id);
    } else {
      setDestinationId('');
    }
  };

  return (
    <div className="mt-4 flex flex-col gap-y-6">
      <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
        <div>
          <FloatingLabelInput
            type="text"
            id="fullName"
            name="fullName"
            defaultValue={defaultFullName}
            required
            autoComplete="given-name"
            label="Full Name *"
          />
        </div>

        <div className="sm:col-span-2">
          <FloatingLabelInput
            type="text"
            name="company"
            id="company"
            defaultValue={address?.company ?? ''}
            label="Company"
          />
        </div>

        <div className="sm:col-span-2">
          <FloatingLabelInput
            type="text"
            name="streetLine1"
            id="streetLine1"
            defaultValue={address?.streetLine1 ?? ''}
            required
            autoComplete="street-address"
            label="Address *"
          />
        </div>

        <div className="sm:col-span-2">
          <FloatingLabelInput
            type="text"
            name="streetLine2"
            id="streetLine2"
            defaultValue={address?.streetLine2 ?? ''}
            label="Address Line 2"
          />
        </div>

        <div className="sm:col-span-2 border-t border-gray-100 pt-6">
          <DestinationSelector
            selectedDestination={null}
            onSelect={handleDestinationSelect}
            onSearch={searchDestinations}
            label="Search Sub-district (Kecamatan) / Pin location"
            placeholder="Type your kecamatan or village..."
            initialLabel={address?.city ? `${address.city}, ${address.province}` : ''}
          />
          <input type="hidden" name="rajaOngkirDestinationId" value={destinationId} />
        </div>

        <div>
          <FloatingLabelInput
            type="text"
            name="city"
            id="city"
            autoComplete="address-level2"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            readOnly={!!destinationId}
            label="City *"
            className={destinationId ? "opacity-70" : ""}
          />
        </div>

        <div>
          {/* <label
            htmlFor="countryCode"
            className="block text-xs font-medium text-gray-500 mb-1 ml-1"
          >
            Country <span className="text-red-500">*</span>
          </label> */}
          <div className="relative">
            {availableCountries && (
              <select
                id="countryCode"
                name="countryCode"
                required
                defaultValue={address?.countryCode ?? 'ID'}
                className="block w-full px-4 pt-5 pb-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-karima-brand focus:border-karima-brand sm:text-sm appearance-none bg-transparent"
              >
                {availableCountries.map((item) => (
                  <option key={item.id} value={item.code}>
                    {item.name}
                  </option>
                ))}
              </select>
            )}
            {/* <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div> */}
          </div>
        </div>

        <div>
          <FloatingLabelInput
            type="text"
            name="province"
            id="province"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            required
            readOnly={!!destinationId}
            autoComplete="address-level1"
            label="State / Province *"
            className={destinationId ? "opacity-70" : ""}
          />
        </div>

        <div>
          <FloatingLabelInput
            type="text"
            name="postalCode"
            id="postalCode"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            required
            readOnly={!!destinationId}
            autoComplete="postal-code"
            label="Postal Code *"
            className={destinationId ? "opacity-70" : ""}
          />
        </div>

        <div className="sm:col-span-2">
          <FloatingLabelInput
            type="tel"
            name="phoneNumber"
            id="phoneNumber"
            defaultValue={address?.phoneNumber ?? ''}
            required
            autoComplete="tel"
            label="Phone Number *"
          />
        </div>
      </div>
    </div >
  );
}
