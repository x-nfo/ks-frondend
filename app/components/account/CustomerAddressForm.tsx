import { z } from "zod";
import { useForm, getInputProps, getSelectProps } from "@conform-to/react";
import type { AvailableCountriesQuery } from "~/generated/graphql";
import { Input } from "~/components/Input";
import { Select } from "~/components/Select";

export const addressSchema = z.object({
  fullName: z.string().min(1, { message: "Name is required" }),
  city: z.string().min(1, { message: "City is required" }),
  countryCode: z.string().min(1, { message: "Country is required" }),
  postalCode: z.string().optional(),
  province: z.string().optional(),
  streetLine1: z.string().min(1, { message: "Address is required" }),
  streetLine2: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
});

interface CustomerAddressFormProps {
  fields: ReturnType<typeof useForm<z.infer<typeof addressSchema>>>[1];
  availableCountries: AvailableCountriesQuery["availableCountries"];
}

export default function CustomerAddressForm({
  fields,
  availableCountries,
}: CustomerAddressFormProps) {
  return (
    <div className="grid grid-cols-1 gap-y-2 my-8 text-left font-sans">
      <div className="grid grid-cols-1 gap-x-2">
        <Input
          {...getInputProps(fields.fullName, { type: "text" })}
          label="Full Name"
          required
          autoComplete="full-name"
          error={fields.fullName.errors?.join(", ")}
        />
      </div>
      <Input
        {...getInputProps(fields.company, { type: "text" })}
        label="Company"
        error={fields.company.errors?.join(", ")}
      />
      <Input
        {...getInputProps(fields.streetLine1, { type: "text" })}
        label="Address"
        required
        autoComplete="address-line1"
        error={fields.streetLine1.errors?.join(", ")}
      />
      <Input
        {...getInputProps(fields.streetLine2, { type: "text" })}
        label="Address Line 2"
        autoComplete="address-line2"
        error={fields.streetLine2.errors?.join(", ")}
      />
      <div className="grid grid-cols-[144px_1fr] gap-x-2">
        <Input
          {...getInputProps(fields.postalCode, { type: "text" })}
          label="Postal Code"
          required
          autoComplete="postal-code"
          error={fields.postalCode.errors?.join(", ")}
        />
        <Input
          {...getInputProps(fields.city, { type: "text" })}
          label="City"
          required
          autoComplete="locality"
          error={fields.city.errors?.join(", ")}
        />
      </div>
      <Input
        {...getInputProps(fields.province, { type: "text" })}
        label="State / Province"
        autoComplete="address-level1"
        error={fields.province.errors?.join(", ")}
      />
      <Select
        {...getSelectProps(fields.countryCode)}
        autoComplete="country"
        placeholder="Select Country"
        required
        label="Country"
        error={fields.countryCode.errors?.join(", ")}
      >
        {availableCountries?.map((country) => (
          <option key={country.id} value={country.code}>
            {country.name}
          </option>
        ))}
      </Select>
      <Input
        {...getInputProps(fields.phone, { type: "tel" })}
        label="Phone Number"
        autoComplete="phone"
        error={fields.phone.errors?.join(", ")}
      />
    </div>
  );
}
