import { gql } from "graphql-tag";
import { sdk } from "../../utils/graphqlWrapper";
import type { QueryOptions, WithHeaders } from "../../utils/graphqlWrapper";
import type { OrderListOptions, ActiveCustomerQuery, ActiveCustomerDetailsQuery, ActiveCustomerAddressesQuery, ActiveCustomerOrderListQuery } from "../../generated/graphql";

export function getActiveCustomer(options: QueryOptions) {
  return sdk.activeCustomer(undefined, options).then((res) => {
    if (!res.activeCustomer) {
      return null;
    }
    return {
      activeCustomer: res.activeCustomer,
      _headers: (res as WithHeaders<ActiveCustomerQuery>)._headers,
    };
  });
}

export function getActiveCustomerDetails(options: QueryOptions) {
  return sdk.activeCustomerDetails(undefined, options).then((res) => {
    if (!res.activeCustomer) {
      return null;
    }
    return {
      activeCustomer: res.activeCustomer,
      _headers: (res as WithHeaders<ActiveCustomerDetailsQuery>)._headers,
    };
  });
}

export function getActiveCustomerAddresses(options: QueryOptions) {
  return sdk.activeCustomerAddresses(undefined, options).then((res) => {
    if (!res.activeCustomer) {
      return null;
    }
    return {
      activeCustomer: res.activeCustomer,
      _headers: (res as WithHeaders<ActiveCustomerAddressesQuery>)._headers,
    };
  });
}

export function getActiveCustomerOrderList(orderListOptions: OrderListOptions, options: QueryOptions) {
  return sdk.activeCustomerOrderList({ orderListOptions }, options).then((res) => {
    if (!res.activeCustomer?.orders) {
      return null;
    }
    return {
      activeCustomer: res.activeCustomer,
      _headers: (res as WithHeaders<ActiveCustomerOrderListQuery>)._headers,
    };
  });
}

gql`
  query activeCustomer {
    activeCustomer {
      id
      firstName
      lastName
    }
  }
`;

gql`
  query activeCustomerDetails {
    activeCustomer {
      id
      title
      firstName
      lastName
      phoneNumber
      emailAddress
    }
  }
`;

gql`
  query activeCustomerAddresses {
    activeCustomer {
      id
      firstName
      lastName
      emailAddress
      addresses {
        id
        company
        fullName
        streetLine1
        streetLine2
        city
        province
        postalCode
        country {
          id
          code
          name
        }
        phoneNumber
        defaultShippingAddress
        defaultBillingAddress
        customFields {
          rajaOngkirDestinationId
        }
      }
    }
  }
`;

gql`
  query activeCustomerOrderList($orderListOptions: OrderListOptions) {
    activeCustomer {
      orders(options: $orderListOptions) {
        totalItems
        items {
          id
          code
          state
          orderPlacedAt
          currencyCode
          subTotal
          subTotalWithTax
          total
          totalWithTax
          shippingWithTax
          shippingLines {
            priceWithTax
          }
          taxSummary {
            taxBase
            taxTotal
          }
          discounts {
            amountWithTax
          }
          fulfillments {
            id
            trackingCode
          }
          lines {
            id
            quantity
            discountedLinePriceWithTax
            discountedUnitPriceWithTax
            fulfillmentLines {
              quantity
              fulfillment {
                id
                state
                updatedAt
              }
            }
            featuredAsset {
              name
              source
              preview
            }
            productVariant {
              name
              sku
              currencyCode
              priceWithTax
              product {
                slug
              }
            }
          }
        }
      }
    }
  }
`;
