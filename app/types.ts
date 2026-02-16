import type { CreateAddressInput } from './generated/graphql';
import { useActiveOrder } from './utils/use-active-order';

export type OutletContext = {
    activeOrderFetcher: any;
    activeOrder: any;
    adjustOrderLine: (lineId: string, quantity: number) => void;
    removeItem: (lineId: string) => void;
    applyCoupon: (code: string) => void;
    removeCoupon: (code: string) => void;
};

export type ShippingFormData = CreateAddressInput;
