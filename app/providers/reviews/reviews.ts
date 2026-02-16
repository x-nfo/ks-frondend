import { gql } from "graphql-tag";
import { sdk } from "../../utils/graphqlWrapper";
import type { QueryOptions, WithHeaders } from "../../utils/graphqlWrapper";
import type { ProductReviewsQuery, SubmitReviewMutation } from "../../generated/graphql";

export const productReviewFragment = gql`
  fragment ProductReview on ProductReview {
    id
    createdAt
    rating
    summary
    body
    state
    authorName
  }
`;

const productReviewsQuery = gql`
  query productReviews($productId: ID!) {
    product(id: $productId) {
      id
      reviews {
        ...ProductReview
      }
    }
  }
  ${productReviewFragment}
`;

const submitReviewMutation = gql`
  mutation submitReview($input: SubmitReviewInput!) {
    submitReview(input: $input) {
      ...ProductReview
    }
  }
  ${productReviewFragment}
`;

export async function getProductReviews(productId: string, options: QueryOptions) {
  return sdk.productReviews({ productId }, options).then((res) => {
    if (!res.product) {
      return null;
    }
    return {
      items: res.product.reviews,
      _headers: (res as WithHeaders<ProductReviewsQuery>)._headers,
    };
  });
}

export async function submitReview(
  input: { productId: string; rating: number; summary: string; body: string },
  options: QueryOptions,
) {
  return sdk.submitReview({ input }, options).then((res) => ({
    submitReview: res.submitReview,
    _headers: (res as WithHeaders<SubmitReviewMutation>)._headers,
  }));
}
