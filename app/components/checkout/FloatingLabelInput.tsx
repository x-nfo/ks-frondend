import React, { useState, type InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface FloatingLabelInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    icon?: React.ReactNode;
}

export function FloatingLabelInput({
    label,
    error,
    icon,
    className,
    id,
    value,
    defaultValue,
    ...props
}: FloatingLabelInputProps) {
    // If value/defaultValue is controlled/uncontrolled, we need to know if it has content to float the label
    // We can use a simple check or focus state. 
    // Ideally we rely on :placeholder-shown CSS trick, but for "floating" to the top border (outline style),
    // we often need a peer-focus or state.
    // Let's use the standard "peer" CSS approach which is clean and robust with Tailwind.

    // Logic: 
    // Input needs a placeholder (usually " ") to detect :placeholder-shown.
    // Label sits on top when :not(:placeholder-shown) or :focus.

    // We need to ensure we handle the `value` prop correctly if it's controlled.

    // Determine if this is a controlled or uncontrolled input.
    // Never pass both value and defaultValue to avoid React's uncontrolled→controlled warning.
    const inputValueProps = value !== undefined
        ? { value }
        : { defaultValue };

    return (
        <div className={clsx("relative", className)}>
            <input
                id={id}
                autoComplete="off"
                {...props}
                {...inputValueProps}
                placeholder=" "
                className={clsx(
                    "block px-4 pb-2.5 pt-5 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-200 appearance-none focus:outline-none focus:ring-0 peer font-sans transition-all",
                    error ? "border-red-500 focus:border-red-600" : "border-gray-200 focus:border-karima-brand"
                )}
            />
            <label
                htmlFor={id}
                className={clsx(
                    "absolute text-sm duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-left left-4 peer-focus:text-karima-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 bg-white px-1",
                    error ? "text-red-500" : "text-gray-500"
                )}
            >
                {icon && <span className="inline-block mr-1 align-bottom">{icon}</span>}
                {label}
            </label>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}
