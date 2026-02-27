import { gql } from "graphql-request";
import { sdk } from "../../utils/graphqlWrapper";
import type { QueryOptions } from "../../utils/graphqlWrapper";
import type { SearchQueryVariables } from "../../generated/graphql";

export function search(variables: SearchQueryVariables, options: QueryOptions) {
  return sdk.search(variables, options);
}

export function searchFacetValues(
  variables: SearchQueryVariables,
  options: QueryOptions
) {
  return sdk.searchFacetValues(variables, options);
}

export function getProductBySlug(slug: string, options: QueryOptions) {
  return sdk.product({ slug }, options);
}

export const detailedProductFragment = gql`
  fragment DetailedProduct on Product {
    id
    name
    slug
    description
    collections {
      id
      slug
      name
      breadcrumbs {
        id
        name
        slug
      }
    }
    optionGroups {
      id
      code
      name
    }
    facetValues {
      facet {
        id
        code
        name
      }
      id
      code
      name
    }
    featuredAsset {
      id
      preview
    }
    assets {
      id
      preview
    }
    variants {
      id
      name
      priceWithTax
      currencyCode
      sku
      stockLevel
      options {
        id
        code
        name
        group {
          id
          code
          name
        }
      }
      featuredAsset {
        id
        preview
      }
      assets {
        id
        preview
      }
      facetValues {
        facet {
          id
          code
          name
        }
        id
        code
        name
      }
    }
  }
`;

const productQuery = gql`
  query product($slug: String, $id: ID) {
    product(slug: $slug, id: $id) {
      ...DetailedProduct
    }
  }
  ${detailedProductFragment}
`;

export const listedProductFragment = gql`
  fragment ListedProduct on SearchResult {
    productId
    productName
    slug
    productAsset {
      id
      preview
    }
    productVariantAsset {
      id
      preview
    }
    currencyCode
    priceWithTax {
      ... on PriceRange {
        min
        max
      }
      ... on SinglePrice {
        value
      }
    }
    facetValueIds
    productVariantId
  }
`;

const searchQuery = gql`
  query search($input: SearchInput!) {
    search(input: $input) {
      totalItems
      items {
        ...ListedProduct
      }
      facetValues {
        count
        facetValue {
          id
          name
          facet {
            id
            name
          }
        }
      }
    }
  }
  ${listedProductFragment}
`;

const searchFacetValuesQuery = gql`
  query searchFacetValues($input: SearchInput!) {
    search(input: $input) {
      totalItems
      facetValues {
        count
        facetValue {
          id
          name
          facet {
            id
            name
          }
        }
      }
    }
  }
`;
