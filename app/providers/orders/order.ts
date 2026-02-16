import { gql } from "graphql-tag";
import { sdk } from "../../utils/graphqlWrapper";
import type { QueryOptions, WithHeaders } from "../../utils/graphqlWrapper";
import type {
  CreateAddressInput,
  CreateCustomerInput,
  ActiveOrderQuery,
  OrderByCodeQuery,
  AddItemToOrderMutation,
  RemoveOrderLineMutation,
  AdjustOrderLineMutation,
  SetCustomerForOrderMutation,
  SetOrderShippingAddressMutation,
  SetOrderBillingAddressMutation,
  SetOrderShippingMethodMutation,
} from "../../generated/graphql";


export function getActiveOrder(options: QueryOptions) {
  return sdk.activeOrder(undefined, options).then((res) => {
    if (!res.activeOrder) {
      return null;
    }
    return {
      ...res.activeOrder,
      _headers: (res as WithHeaders<ActiveOrderQuery>)._headers,
    };
  });
}

export function getOrderByCode(code: string, options: QueryOptions) {
  return sdk.orderByCode({ code }, options).then((res) => {
    if (!res.orderByCode) {
      return null;
    }
    return {
      ...res.orderByCode,
      _headers: (res as WithHeaders<OrderByCodeQuery>)._headers,
    };
  });
}

export function addItemToOrder(
  productVariantId: string,
  quantity: number,
  options: QueryOptions,
) {
  return sdk.addItemToOrder(
    {
      productVariantId,
      quantity,
    },
    options,
  ).then((res) => ({
    addItemToOrder: res.addItemToOrder,
    _headers: (res as WithHeaders<AddItemToOrderMutation>)._headers,
  }));
}

export function removeOrderLine(lineId: string, options: QueryOptions) {
  return sdk.removeOrderLine({ orderLineId: lineId }, options).then((res) => ({
    removeOrderLine: res.removeOrderLine,
    _headers: (res as WithHeaders<RemoveOrderLineMutation>)._headers,
  }));
}

export function adjustOrderLine(
  lineId: string,
  quantity: number,
  options: QueryOptions,
) {
  return sdk.adjustOrderLine({ orderLineId: lineId, quantity }, options).then((res) => ({
    adjustOrderLine: res.adjustOrderLine,
    _headers: (res as WithHeaders<AdjustOrderLineMutation>)._headers,
  }));
}

export function setCustomerForOrder(
  input: CreateCustomerInput,
  options: QueryOptions,
) {
  return sdk.setCustomerForOrder({ input }, options).then((res) => ({
    setCustomerForOrder: res.setCustomerForOrder,
    _headers: (res as WithHeaders<SetCustomerForOrderMutation>)._headers,
  }));
}

export function setOrderShippingAddress(
  input: CreateAddressInput,
  options: QueryOptions,
) {
  return sdk.setOrderShippingAddress({ input }, options).then((res) => ({
    setOrderShippingAddress: res.setOrderShippingAddress,
    _headers: (res as WithHeaders<SetOrderShippingAddressMutation>)._headers,
  }));
}

export function setOrderBillingAddress(
  input: CreateAddressInput,
  options: QueryOptions,
) {
  return sdk.setOrderBillingAddress({ input }, options).then((res) => ({
    setOrderBillingAddress: res.setOrderBillingAddress,
    _headers: (res as WithHeaders<SetOrderBillingAddressMutation>)._headers,
  }));
}

export function setOrderShippingMethod(
  shippingMethodId: string,
  options: QueryOptions,
) {
  return sdk.setOrderShippingMethod({ shippingMethodId: [shippingMethodId] }, options).then((res) => ({
    setOrderShippingMethod: res.setOrderShippingMethod,
    _headers: (res as WithHeaders<SetOrderShippingMethodMutation>)._headers,
  }));
}



export const orderDetailFragment = gql`
  fragment ExtendedOrderDetail on Order {
    __typename
    id
    code
    active
    createdAt
    state
    currencyCode
    totalQuantity
    subTotal
    subTotalWithTax
    taxSummary {
      description
      taxRate
      taxTotal
    }
    shippingWithTax
    shippingWithTax
    totalWithTax
    couponCodes
    discounts {
      description
      amountWithTax
    }
    customer {
      id
      firstName
      lastName
      emailAddress
    }
    shippingAddress {
      fullName
      streetLine1
      streetLine2
      company
      city
      province
      postalCode
      countryCode
      phoneNumber
      customFields {
        rajaOngkirDestinationId
      }
    }
    billingAddress {
      fullName
      streetLine1
      streetLine2
      company
      city
      province
      postalCode
      countryCode
      phoneNumber
      customFields {
        rajaOngkirDestinationId
      }
    }
    shippingLines {
      shippingMethod {
        id
        name
        description
      }
      priceWithTax
    }
    shipping
    lines {
      id
      unitPriceWithTax
      linePriceWithTax
      quantity
      featuredAsset {
        id
        preview
      }
      productVariant {
        id
        name
        price
        product {
          id
          slug
        }
      }
      proratedUnitPriceWithTax
      discounts {
        description
        amountWithTax
      }
    }
    payments {
      id
      state
      method
      amount
      transactionId
      metadata
    }
  }
`;

gql`
  query activeOrder {
    activeOrder {
      ...ExtendedOrderDetail
    }
  }
  ${orderDetailFragment}
`;

gql`
  query orderByCode($code: String!) {
    orderByCode(code: $code) {
      ...ExtendedOrderDetail
    }
  }
  ${orderDetailFragment}
`;

gql`
  mutation addItemToOrder($productVariantId: ID!, $quantity: Int!) {
    addItemToOrder(productVariantId: $productVariantId, quantity: $quantity) {
      ...ExtendedOrderDetail
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
  ${orderDetailFragment}
`;

gql`
  mutation removeOrderLine($orderLineId: ID!) {
    removeOrderLine(orderLineId: $orderLineId) {
      ...ExtendedOrderDetail
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
  ${orderDetailFragment}
`;

gql`
  mutation adjustOrderLine($orderLineId: ID!, $quantity: Int!) {
    adjustOrderLine(orderLineId: $orderLineId, quantity: $quantity) {
      ...ExtendedOrderDetail
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
  ${orderDetailFragment}
`;

gql`
  mutation setCustomerForOrder($input: CreateCustomerInput!) {
    setCustomerForOrder(input: $input) {
      ...ExtendedOrderDetail
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
  ${orderDetailFragment}
`;

gql`
  mutation setOrderShippingAddress($input: CreateAddressInput!) {
    setOrderShippingAddress(input: $input) {
      ...ExtendedOrderDetail
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
  ${orderDetailFragment}
`;

gql`
  mutation setOrderBillingAddress($input: CreateAddressInput!) {
    setOrderBillingAddress(input: $input) {
      ...ExtendedOrderDetail
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
  ${orderDetailFragment}
`;

gql`
  mutation setOrderShippingMethod($shippingMethodId: [ID!]!) {
    setOrderShippingMethod(shippingMethodId: $shippingMethodId) {
      ...ExtendedOrderDetail
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
  ${orderDetailFragment}
`;
