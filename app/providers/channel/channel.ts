import { gql } from "graphql-request";
import { sdk } from "../../utils/graphqlWrapper";
import type { QueryOptions } from "../../utils/graphqlWrapper";

export function activeChannel(options: QueryOptions) {
  return sdk
    .activeChannel(undefined, options)
    .then(({ activeChannel }) => activeChannel);
}

const activeChannelQuery = gql`
  query activeChannel {
    activeChannel {
      id
      currencyCode
    }
  }
`;
