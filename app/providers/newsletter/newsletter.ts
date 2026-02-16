import { sdk } from "../../utils/graphqlWrapper";
import gql from "graphql-tag";

export const SUBSCRIBE_TO_NEWSLETTER = gql`
  mutation SubscribeToNewsletter($email: String!) {
    subscribeToNewsletter(email: $email) {
      id
      email
      isVerified
    }
  }
`;

export async function subscribeToNewsletter(email: string) {
    return sdk.SubscribeToNewsletter({ email });
}
