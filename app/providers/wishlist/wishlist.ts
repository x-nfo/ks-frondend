import { gql } from "graphql-tag";
import { sdk } from "../../utils/graphqlWrapper";
import type { QueryOptions, WithHeaders } from "../../utils/graphqlWrapper";
import type { ActiveCustomerWishlistQuery, AddToWishlistMutation, RemoveFromWishlistMutation } from "../../generated/graphql";

export async function getActiveCustomerWishlist(options: QueryOptions) {
  return sdk.activeCustomerWishlist(undefined, options).then((res) => {
    return {
      activeCustomerWishlist: res.activeCustomerWishlist,
      _headers: (res as WithHeaders<ActiveCustomerWishlistQuery>)._headers,
    };
  });
}

export async function addToWishlist(productVariantId: string, options: QueryOptions) {
  return sdk.addToWishlist({ productVariantId }, options).then((res) => ({
    addToWishlist: res.addToWishlist,
    _headers: (res as WithHeaders<AddToWishlistMutation>)._headers,
  }));
}

export async function removeFromWishlist(
  itemId: string,
  options: QueryOptions
) {
  return sdk.removeFromWishlist({ itemId }, options).then((res) => ({
    removeFromWishlist: res.removeFromWishlist,
    _headers: (res as WithHeaders<RemoveFromWishlistMutation>)._headers,
  }));
}

gql`
  query activeCustomerWishlist {
    activeCustomerWishlist {
      id
      createdAt
      productVariant {
        id
        name
        price
        currencyCode
        product {
          id
          name
          slug
          featuredAsset {
            id
            preview
          }
        }
      }
    }
  }
`;

gql`
  mutation addToWishlist($productVariantId: ID!) {
    addToWishlist(productVariantId: $productVariantId) {
      id
    }
  }
`;

gql`
  mutation removeFromWishlist($itemId: ID!) {
    removeFromWishlist(itemId: $itemId) {
      id
    }
  }
`;
