import React from "react";
import type { SelectHTMLAttributes } from "react";
import FormElement from "./FormElement";

export type SelectProps = {
  placeholder?: string;
  noPlaceholder?: boolean;
  label?: string;
  name: string;
  error?: string;
} & SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      name,
      label,
      required,
      defaultValue,
      placeholder = "",
      noPlaceholder = false,
      children,
      error,
      ...props
    },
    ref,
  ) => {
    return (
      <FormElement name={name} label={label} required={required} error={error}>
        <select
          ref={ref}
          name={name}
          {...props}
          defaultValue={defaultValue}
          className="block w-full border-gray-300 rounded-sm shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        >
          {!noPlaceholder && (
            <option value="">{placeholder ?? "Select"}</option>
          )}
          {children}
        </select>
      </FormElement>
    );
  },
);
