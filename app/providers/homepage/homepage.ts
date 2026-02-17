import { sdk } from "../../utils/graphqlWrapper";
import type { QueryOptions } from "../../utils/graphqlWrapper";
import { gql } from "graphql-request";

export async function getHomepageData(options?: QueryOptions) {
  return sdk.getActiveHomepageData({}, options);
}

const GET_ACTIVE_HOMEPAGE_DATA = gql`
  query getActiveHomepageData {
    activeHeroBanners {
      id
      imageUrl
      headline
      subtitle
      ctaText
      ctaLink
      sortOrder
    }
    activePromoBanners {
      id
      imageUrl
      title
      description
      linkUrl
      sortOrder
    }
    activeFeaturedCollections {
      id
      collectionId
      sortOrder
    }
    activePopup {
      id
      imageUrl
      title
      linkUrl
      frequency
      delay
    }
  }
`;

