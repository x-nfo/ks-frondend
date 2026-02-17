import { gql } from "graphql-request";
import { sdk } from "../../utils/graphqlWrapper";
import type { QueryOptions } from "../../utils/graphqlWrapper";
import type { CollectionListOptions } from "../../generated/graphql";

export function getCollections(
  options?: CollectionListOptions,
  queryOptions?: QueryOptions
) {
  return sdk
    .collections({ options }, queryOptions)
    .then((result) => result.collections?.items);
}

export function getCollection(slug: string, queryOptions?: QueryOptions) {
  return sdk.collection({ slug }, queryOptions).then((result) => result.collection);
}

const collectionsQuery = gql`
  query collections($options: CollectionListOptions) {
    collections(options: $options) {
      items {
        id
        name
        slug
        parent {
          name
        }
        featuredAsset {
          id
          preview
        }
      }
    }
  }
`;

const collectionQuery = gql`
  query collection($slug: String, $id: ID) {
    collection(slug: $slug, id: $id) {
      id
      name
      slug
      breadcrumbs {
        id
        name
        slug
      }
      children {
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
`;
