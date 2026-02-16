import { gql } from "graphql-tag";
import { sdk } from "../../utils/graphqlWrapper";
import type { QueryOptions, WithHeaders } from "../../utils/graphqlWrapper";
import type {
  PaymentInput,
  AddPaymentToOrderMutation,
  TransitionOrderToStateMutation
} from "../../generated/graphql";
import { orderDetailFragment } from "../orders/order";

export function getAvailableCountries(options: QueryOptions) {
  return sdk.availableCountries({}, options);
}

export function getEligibleShippingMethods(options: QueryOptions) {
  return sdk.eligibleShippingMethods({}, options);
}

export function getEligiblePaymentMethods(options: QueryOptions) {
  return sdk.eligiblePaymentMethods({}, options);
}



export function getNextOrderStates(options: QueryOptions) {
  return sdk.nextOrderStates({}, options);
}

export function addPaymentToOrder(input: PaymentInput, options: QueryOptions) {
  return sdk.addPaymentToOrder({ input }, options).then((res) => ({
    addPaymentToOrder: res.addPaymentToOrder,
    _headers: (res as WithHeaders<AddPaymentToOrderMutation>)._headers,
  }));
}

export function transitionOrderToState(state: string, options: QueryOptions) {
  return sdk.transitionOrderToState({ state }, options).then((res) => ({
    transitionOrderToState: res.transitionOrderToState,
    _headers: (res as WithHeaders<TransitionOrderToStateMutation>)._headers,
  }));
}

export function applyCouponCode(couponCode: string, options: QueryOptions) {
  return sdk.applyCouponCode({ couponCode }, options);
}

export function removeCouponCode(couponCode: string, options: QueryOptions) {
  return sdk.removeCouponCode({ couponCode }, options);
}

export function getMidtransClientConfig(options: QueryOptions) {
  return sdk.midtransClientConfig({}, options);
}

export function getMidtransTransactionStatus(
  transactionId: string,
  options: QueryOptions,
) {
  return sdk.midtransTransactionStatus({ transactionId }, options);
}

// RajaOngkir Functions
export function searchRajaOngkirDestinations(
  search: string,
  options: QueryOptions,
  limit?: number,
  offset?: number,
) {
  return sdk.rajaOngkirSearchDestinations({ search, limit, offset }, options);
}

export function calculateRajaOngkirShipping(
  destinationId: number,
  weight: number,
  options: QueryOptions,
) {
  return sdk.rajaOngkirCalculateShipping({ destinationId, weight }, options);
}

export function getRajaOngkirCouriers(options: QueryOptions) {
  return sdk.rajaOngkirAvailableCouriers({}, options);
}

gql`
  query eligibleShippingMethods {
    eligibleShippingMethods {
      id
      name
      description
      metadata
      price
      priceWithTax
    }
  }
`;

gql`
  query eligiblePaymentMethods {
    eligiblePaymentMethods {
      id
      code
      name
      description
      eligibilityMessage
      isEligible
    }
  }
`;

gql`
  query nextOrderStates {
    nextOrderStates
  }
`;

gql`
  query availableCountries {
    availableCountries {
      id
      name
      code
    }
  }
`;

gql`
  mutation addPaymentToOrder($input: PaymentInput!) {
    addPaymentToOrder(input: $input) {
      ...ExtendedOrderDetail
      ... on Order {
        payments {
          transactionId
          metadata
        }
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
  ${orderDetailFragment}
`;

gql`
  mutation transitionOrderToState($state: String!) {
    transitionOrderToState(state: $state) {
      ...ExtendedOrderDetail
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
  ${orderDetailFragment}
`;



// Midtrans Payment Queries
gql`
  query midtransClientConfig {
    midtransClientConfig {
      clientKey
      isProduction
      merchantId
    }
  }
`;

// RajaOngkir Shipping Queries
gql`
  query rajaOngkirSearchDestinations($search: String!, $limit: Int, $offset: Int) {
    rajaOngkirSearchDestinations(search: $search, limit: $limit, offset: $offset) {
      id
      label
      provinceName
      cityName
      districtName
      subdistrictName
      zipCode
    }
  }
`;

gql`
  query rajaOngkirCalculateShipping($destinationId: Int!, $weight: Int!) {
    rajaOngkirCalculateShipping(destinationId: $destinationId, weight: $weight) {
      id
      courierCode
      courierName
      service
      description
      cost
      etd
    }
  }
`;

gql`
  query rajaOngkirAvailableCouriers {
    rajaOngkirAvailableCouriers {
      code
      name
      description
    }
  }
`;

gql`
  query midtransTransactionStatus($transactionId: String!) {
    midtransTransactionStatus(transactionId: $transactionId) {
      transactionId
      orderId
      transactionStatus
      fraudStatus
      paymentType
      grossAmount
      settlementTime
    }
  }
`;

gql`
  mutation applyCouponCode($couponCode: String!) {
    applyCouponCode(couponCode: $couponCode) {
      ...ExtendedOrderDetail
      ... on CouponCodeExpiredError {
        errorCode
        message
      }
      ... on CouponCodeInvalidError {
        errorCode
        message
      }
      ... on CouponCodeLimitError {
        errorCode
        message
      }
    }
  }
  ${orderDetailFragment}
`;

gql`
  mutation removeCouponCode($couponCode: String!) {
    removeCouponCode(couponCode: $couponCode) {
      ...ExtendedOrderDetail
    }
  }
  ${orderDetailFragment}
`;

