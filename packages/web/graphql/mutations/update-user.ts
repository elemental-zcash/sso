import { gql } from '@apollo/client';

const UPDATE_USER = gql`
  mutation updateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      __typename
      ...on UpdateUserSuccess {
        user {
          id
          username
          unverifiedEmail
          isVerifiedEmail
        }
      }
      ...on UpdateUserInputError {
        message
        code
      }
    }
  }
`;

export default UPDATE_USER;
