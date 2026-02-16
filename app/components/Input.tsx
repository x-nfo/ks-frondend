import clsx from 'clsx';
import React from 'react';
import FormElement from './FormElement';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    name: string;
    error?: string;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ name, label, required, error, ...props }, ref) => {
        return (
            <FormElement name={name} label={label} required={required} error={error}>
                <input
                    ref={ref}
                    name={name}
                    {...props}
                    className={clsx(
                        'block w-full py-2 px-4 shadow-sm border bg-white rounded-sm text-base sm:text-sm text-karima-ink border-gray-300 placeholder-gray-500',
                        'focus:ring-karima-brand focus:border-karima-brand focus:outline-none focus:ring-2 focus:placeholder-gray-400',
                        {
                            'border-rose-500 focus:border-rose-500': error,
                        },
                        props.className,
                    )}
                />
            </FormElement>
        );
    },
);
