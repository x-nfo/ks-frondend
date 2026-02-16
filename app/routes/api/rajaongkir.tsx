import { data } from "react-router";
import type { Route } from './+types/rajaongkir';
import {
    searchRajaOngkirDestinations,
    calculateRajaOngkirShipping,
    getRajaOngkirCouriers,
} from '~/providers/checkout/checkout';

export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    try {
        switch (action) {
            case 'searchDestinations': {
                const search = url.searchParams.get('search') || '';
                const limit = parseInt(url.searchParams.get('limit') || '10', 10);
                const offset = parseInt(url.searchParams.get('offset') || '0', 10);

                if (search.length < 3) {
                    return data({ destinations: [] });
                }

                const { rajaOngkirSearchDestinations } = await searchRajaOngkirDestinations(
                    search,
                    { request },
                    limit,
                    offset,
                );

                return data({ destinations: rajaOngkirSearchDestinations });
            }

            case 'calculateShipping': {
                const destinationId = parseInt(url.searchParams.get('destinationId') || '0', 10);
                const weight = parseInt(url.searchParams.get('weight') || '1000', 10);

                if (!destinationId) {
                    return data({ error: 'Destination ID required' }, { status: 400 });
                }

                const { rajaOngkirCalculateShipping } = await calculateRajaOngkirShipping(
                    destinationId,
                    weight,
                    { request },
                );

                return data({ shippingOptions: rajaOngkirCalculateShipping });
            }

            case 'getCouriers': {
                const { rajaOngkirAvailableCouriers } = await getRajaOngkirCouriers({ request });
                return data({ couriers: rajaOngkirAvailableCouriers });
            }

            default:
                return data({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('RajaOngkir API error:', error);
        return data({ error: 'Failed to fetch data from RajaOngkir' }, { status: 500 });
    }
}
