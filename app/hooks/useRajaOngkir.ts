import { useState, useCallback } from 'react';
import type {
    RajaOngkirSearchDestinationsQuery,
    RajaOngkirCalculateShippingQuery,
} from '~/generated/graphql';

type Destination = RajaOngkirSearchDestinationsQuery['rajaOngkirSearchDestinations'][0];
type ShippingOption = RajaOngkirCalculateShippingQuery['rajaOngkirCalculateShipping'][0];

interface SearchResponse {
    destinations?: Destination[];
    error?: string;
}

interface ShippingResponse {
    shippingOptions?: ShippingOption[];
    error?: string;
}

interface UseRajaOngkirReturn {
    // Destination search
    searchDestinations: (query: string) => Promise<Destination[]>;

    // Shipping calculation
    shippingOptions: ShippingOption[];
    isLoadingShipping: boolean;
    calculateShipping: (destinationId: number, weight?: number) => Promise<void>;

    // Selected values
    selectedDestination: Destination | null;
    setSelectedDestination: (destination: Destination | null) => void;
    selectedShippingOption: ShippingOption | null;
    setSelectedShippingOption: (option: ShippingOption | null) => void;

    // Error handling
    error: string | null;
}

export function useRajaOngkir(defaultWeight: number = 1000): UseRajaOngkirReturn {
    const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
    const [selectedShippingOption, setSelectedShippingOption] = useState<ShippingOption | null>(null);
    const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
    const [isLoadingShipping, setIsLoadingShipping] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchDestinations = useCallback(async (query: string): Promise<Destination[]> => {
        if (query.length < 3) return [];

        try {
            const response = await fetch(
                `/api/rajaongkir?action=searchDestinations&search=${encodeURIComponent(query)}`
            );
            const data: SearchResponse = await response.json();

            if (data.error) {
                setError(data.error);
                return [];
            }

            return data.destinations || [];
        } catch (err) {
            console.error('Error searching destinations:', err);
            setError('Gagal mencari destinasi');
            return [];
        }
    }, []);

    const calculateShipping = useCallback(async (destinationId: number, weight: number = defaultWeight) => {
        setIsLoadingShipping(true);
        setError(null);
        setShippingOptions([]);
        setSelectedShippingOption(null);

        try {
            const response = await fetch(
                `/api/rajaongkir?action=calculateShipping&destinationId=${destinationId}&weight=${weight}`
            );
            const data: ShippingResponse = await response.json();

            if (data.error) {
                setError(data.error);
                return;
            }

            setShippingOptions(data.shippingOptions || []);
        } catch (err) {
            console.error('Error calculating shipping:', err);
            setError('Gagal menghitung ongkos kirim');
        } finally {
            setIsLoadingShipping(false);
        }
    }, [defaultWeight]);

    const handleSetSelectedDestination = useCallback((destination: Destination | null) => {
        setSelectedDestination(destination);
        setSelectedShippingOption(null);
        setShippingOptions([]);

        if (destination) {
            // destination.id is likely a string or number, hook expects number
            calculateShipping(typeof destination.id === 'string' ? parseInt(destination.id, 10) : destination.id);
        }
    }, [calculateShipping]);

    return {
        searchDestinations,
        shippingOptions,
        isLoadingShipping,
        calculateShipping,
        selectedDestination,
        setSelectedDestination: handleSetSelectedDestination,
        selectedShippingOption,
        setSelectedShippingOption,
        error,
    };
}
