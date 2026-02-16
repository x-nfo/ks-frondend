import { gql } from "graphql-tag";
import { sdk } from "../../utils/graphqlWrapper";
import type { QueryOptions, WithHeaders } from "../../utils/graphqlWrapper";
import type {
  LoginMutation,
  LogoutMutation,
  RegisterCustomerAccountMutation,
  VerifyCustomerAccountMutation,
  UpdateCustomerInput,
  UpdateAddressInput,
  CreateAddressInput,
  LoginMutationVariables,
  LogoutMutationVariables,
} from "../../generated/graphql";

export function login(variables: LoginMutationVariables, options?: QueryOptions) {
  return sdk.login(variables, options).then((res) => ({
    ...(res as WithHeaders<LoginMutation>).login,
    _headers: (res as WithHeaders<LoginMutation>)._headers,
  }));
}

export function logout(variables?: LogoutMutationVariables, options?: QueryOptions) {
  return sdk.logout(variables, options).then((res) => ({
    ...(res as WithHeaders<LogoutMutation>).logout,
    _headers: (res as WithHeaders<LogoutMutation>)._headers,
  }));
}

export async function registerCustomerAccount(
  input: {
    firstName: string;
    lastName: string;
    emailAddress: string;
    password?: string;
    phoneNumber?: string;
  },
  options: QueryOptions,
) {
  return sdk.registerCustomerAccount({ input }, options).then((res) => ({
    ...(res as WithHeaders<RegisterCustomerAccountMutation>).registerCustomerAccount,
    _headers: (res as WithHeaders<RegisterCustomerAccountMutation>)._headers,
  }));
}

export async function verifyCustomerAccount(
  options: QueryOptions,
  token: string,
  password?: string,
) {
  return sdk.verifyCustomerAccount({ token, password }, options).then((res) => ({
    ...(res as WithHeaders<VerifyCustomerAccountMutation>).verifyCustomerAccount,
    _headers: (res as WithHeaders<VerifyCustomerAccountMutation>)._headers,
  }));
}

export async function updateCustomer(
  input: UpdateCustomerInput,
  options: QueryOptions,
) {
  return sdk.updateCustomer({ input }, options).then((res) => res.updateCustomer);
}

export async function requestUpdateCustomerEmailAddress(
  password: string,
  newEmailAddress: string,
  options: QueryOptions,
) {
  return sdk
    .requestUpdateCustomerEmailAddress({ password, newEmailAddress }, options)
    .then((res) => res.requestUpdateCustomerEmailAddress);
}

export async function updateCustomerEmailAddress(
  token: string,
  options: QueryOptions,
) {
  return sdk
    .updateCustomerEmailAddress({ token }, options)
    .then((res) => res.updateCustomerEmailAddress);
}

export async function updateCustomerAddress(
  input: UpdateAddressInput,
  options: QueryOptions,
) {
  return sdk
    .updateCustomerAddress({ input }, options)
    .then((res) => res.updateCustomerAddress);
}

export async function createCustomerAddress(
  input: CreateAddressInput,
  options: QueryOptions,
) {
  return sdk
    .createCustomerAddress({ input }, options)
    .then((res) => res.createCustomerAddress);
}

export async function deleteCustomerAddress(id: string, options: QueryOptions) {
  return sdk
    .deleteCustomerAddress({ id }, options)
    .then((res) => (res.deleteCustomerAddress as any));
}

export async function updateCustomerPassword(
  input: { currentPassword: string; newPassword: string },
  options: QueryOptions,
) {
  return sdk
    .updateCustomerPassword(input, options)
    .then((res) => res.updateCustomerPassword);
}

gql`
    mutation login($email: String!, $password: String!, $rememberMe: Boolean) {
        login(username: $email, password: $password, rememberMe: $rememberMe) {
            __typename
            ... on CurrentUser {
                id
                identifier
            }
            ... on InvalidCredentialsError {
                errorCode
                message
            }
            ... on NativeAuthStrategyError {
                errorCode
                message
            }
            ... on NotVerifiedError {
                errorCode
                message
            }
            ... on ErrorResult {
                errorCode
                message
            }
        }
    }
`;

gql`
    mutation logout {
        logout {
            success
        }
    }
`;

gql`
    mutation registerCustomerAccount($input: RegisterCustomerInput!) {
        registerCustomerAccount(input: $input) {
            __typename
            ... on Success {
                success
            }
            ... on MissingPasswordError {
                errorCode
                message
            }
            ... on PasswordValidationError {
                errorCode
                message
                validationErrorMessage
            }
            ... on NativeAuthStrategyError {
                errorCode
                message
            }
            ... on ErrorResult {
                errorCode
                message
            }
        }
    }
`;

gql`
    mutation verifyCustomerAccount($token: String!, $password: String) {
        verifyCustomerAccount(token: $token, password: $password) {
            __typename
            ... on CurrentUser {
                id
                identifier
            }
            ... on VerificationTokenInvalidError {
                errorCode
                message
            }
            ... on VerificationTokenExpiredError {
                errorCode
                message
            }
            ... on MissingPasswordError {
                errorCode
                message
            }
            ... on PasswordValidationError {
                errorCode
                message
                validationErrorMessage
            }
            ... on NativeAuthStrategyError {
                errorCode
                message
            }
        }
    }
`;

gql`
  mutation updateCustomer($input: UpdateCustomerInput!) {
    updateCustomer(input: $input) {
      id
      firstName
      lastName
      phoneNumber
      title
    }
  }
`;

gql`
  mutation requestUpdateCustomerEmailAddress(
    $password: String!
    $newEmailAddress: String!
  ) {
    requestUpdateCustomerEmailAddress(
      password: $password
      newEmailAddress: $newEmailAddress
    ) {
      __typename
      ... on Success {
        success
      }
      ... on InvalidCredentialsError {
        errorCode
        message
      }
      ... on NativeAuthStrategyError {
        errorCode
        message
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

gql`
  mutation updateCustomerEmailAddress($token: String!) {
    updateCustomerEmailAddress(token: $token) {
      __typename
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

gql`
  mutation updateCustomerAddress($input: UpdateAddressInput!) {
    updateCustomerAddress(input: $input) {
      __typename
    }
  }
`;

gql`
  mutation createCustomerAddress($input: CreateAddressInput!) {
    createCustomerAddress(input: $input) {
      __typename
    }
  }
`;

gql`
  mutation deleteCustomerAddress($id: ID!) {
    deleteCustomerAddress(id: $id) {
      success
    }
  }
`;

gql`
  mutation updateCustomerPassword(
    $currentPassword: String!
    $newPassword: String!
  ) {
    updateCustomerPassword(
      currentPassword: $currentPassword
      newPassword: $newPassword
    ) {
      __typename
      ... on Success {
        success
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;
export async function requestPasswordReset(email: string, options: QueryOptions) {
  return sdk.requestPasswordReset({ emailAddress: email }, options).then((res) => res.requestPasswordReset);
}

export async function resetPassword(token: string, password: string, options: QueryOptions) {
  return sdk.resetPassword({ token, password }, options).then((res) => res.resetPassword);
}

gql`
  mutation requestPasswordReset($emailAddress: String!) {
    requestPasswordReset(emailAddress: $emailAddress) {
      __typename
      ... on Success {
        success
      }
      ... on NativeAuthStrategyError {
        errorCode
        message
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

gql`
  mutation resetPassword($token: String!, $password: String!) {
    resetPassword(token: $token, password: $password) {
      __typename
      ... on CurrentUser {
        id
        identifier
      }
      ... on PasswordValidationError {
        errorCode
        message
        validationErrorMessage
      }
      ... on PasswordResetTokenInvalidError {
        errorCode
        message
      }
      ... on PasswordResetTokenExpiredError {
        errorCode
        message
      }
    }
  }
`;
