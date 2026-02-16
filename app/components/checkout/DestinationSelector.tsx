import { useState, useEffect } from 'react';
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { clsx } from 'clsx';


interface Destination {
    id: string | number;
    label: string;
    subdistrictName: string;
    districtName: string;
    cityName: string;
    provinceName: string;
    zipCode: string;
}

interface DestinationSelectorProps {
    selectedDestination: Destination | null;
    onSelect: (destination: Destination | null) => void;
    onSearch: (query: string) => Promise<Destination[]>;
    disabled?: boolean;
    initialQuery?: string;
    initialLabel?: string;
    placeholder?: string;
    label?: string;
}

export function DestinationSelector({
    selectedDestination,
    onSelect,
    onSearch,
    disabled = false,
    initialQuery = '',
    initialLabel = '',
    placeholder = "Search City, District, or Postal Code...",
    label = "Delivery Destination"
}: DestinationSelectorProps) {
    const [query, setQuery] = useState(initialQuery || '');
    const [displayText, setDisplayText] = useState(initialLabel || '');
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Sync displayText when selectedDestination changes
    useEffect(() => {
        if (selectedDestination) {
            setDisplayText(selectedDestination.label);
        } else if (!initialLabel) {
            setDisplayText('');
        }
    }, [selectedDestination, initialLabel]);

    // Debounced search
    useEffect(() => {
        if (query.length < 3) {
            setDestinations([]);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setIsLoading(true);
            try {
                const results = await onSearch(query);
                setDestinations(results);

                // Auto-select if exactly one result and it was an automated search (from initialQuery)
                if (results.length === 1 && query === initialQuery && !selectedDestination) {
                    onSelect(results[0]);
                }
            } catch (error) {
                console.error('Error searching destinations:', error);
                setDestinations([]);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query, onSearch, initialQuery, selectedDestination, onSelect]);

    return (
        <div className="w-full">
            <Combobox
                value={selectedDestination}
                onChange={onSelect}
                disabled={disabled}
            >
                <Combobox.Label className="block text-sm font-bold text-karima-ink/80 mb-2 uppercase tracking-wide font-sans">
                    {label}
                </Combobox.Label>
                <div className="relative">
                    <div className="relative w-full cursor-default overflow-hidden rounded-none border border-karima-brand/20 bg-white text-left shadow-sm focus-within:ring-2 focus-within:ring-karima-brand focus-within:border-karima-brand transition-all">
                        <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-karima-ink/40" />
                        <ComboboxInput
                            className="w-full border-none py-3 pl-12 pr-10 text-sm leading-5 text-karima-ink focus:ring-0 font-medium placeholder:text-gray-200 placeholder:font-light font-sans"
                            onChange={(event) => {
                                setQuery(event.target.value);
                                setDisplayText(event.target.value);
                            }}
                            displayValue={(destination: Destination | null) =>
                                destination?.label || displayText || ''
                            }
                            placeholder={placeholder}
                        />
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <ChevronUpDownIcon
                                className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors"
                                aria-hidden="true"
                            />
                        </Combobox.Button>
                    </div>

                    <Transition
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                        afterLeave={() => setQuery('')}
                    >
                        <div className="absolute z-50 w-full">
                            <ComboboxOptions className="mt-1 max-h-72 w-full overflow-auto rounded-none bg-white py-2 text-base shadow-2xl ring-1 ring-black/5 focus:outline-none sm:text-sm border border-karima-brand/10">
                                {isLoading ? (
                                    <div className="relative cursor-default select-none py-4 px-6 text-gray-500">
                                        <div className="flex items-center gap-3">
                                            <svg className="animate-spin h-5 w-5 text-karima-brand" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span className="font-bold text-gray-600 tracking-tight">Searching location...</span>
                                        </div>
                                    </div>
                                ) : destinations.length === 0 && query.length >= 3 ? (
                                    <div className="relative cursor-default select-none py-4 px-6 text-gray-500 bg-gray-50 m-2 rounded-none text-center">
                                        <p className="font-bold text-gray-700">Destination not found</p>
                                        <p className="text-xs text-gray-500 mt-1">Try another keyword or check spelling.</p>
                                    </div>
                                ) : (
                                    destinations.map((destination) => (
                                        <ComboboxOption
                                            key={destination.id}
                                            value={destination}
                                            className={({ active }) =>
                                                clsx(
                                                    'relative cursor-pointer select-none py-3 px-6 transition-colors font-sans',
                                                    active ? 'bg-karima-brand/5' : 'text-karima-ink border-b border-gray-50 last:border-0'
                                                )
                                            }
                                        >
                                            {({ active, selected }) => (
                                                <>
                                                    <div className="flex flex-col">
                                                        <span className={clsx('block truncate text-sm', selected ? 'font-black text-karima-brand' : 'font-bold text-karima-ink')}>
                                                            {destination.subdistrictName}, {destination.districtName}
                                                        </span>
                                                        <span className={clsx(
                                                            'block truncate text-xs mt-1',
                                                            active ? 'text-karima-brand' : 'text-karima-ink/60'
                                                        )}>
                                                            {destination.cityName}, {destination.provinceName} • {destination.zipCode}
                                                        </span>
                                                    </div>

                                                    {selected && (
                                                        <span
                                                            className={clsx(
                                                                'absolute inset-y-0 right-4 flex items-center',
                                                                active ? 'text-karima-brand' : 'text-karima-brand'
                                                            )}
                                                        >
                                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </ComboboxOption>
                                    ))
                                )}
                            </ComboboxOptions>
                        </div>
                    </Transition>
                </div>

                {selectedDestination && (
                    <div className="mt-4 p-4 bg-karima-brand/5 border-2 border-karima-brand/10 rounded-none flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="w-10 h-10 bg-karima-brand/10 rounded-none flex items-center justify-center text-karima-brand flex-shrink-0">
                            <MagnifyingGlassIcon className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-karima-brand uppercase tracking-widest mb-1 font-sans">
                                Shipping Location
                            </p>
                            <p className="text-sm font-bold text-karima-ink leading-tight font-sans">
                                {selectedDestination.label}
                            </p>
                        </div>
                    </div>
                )}
            </Combobox>
        </div>
    );
}
