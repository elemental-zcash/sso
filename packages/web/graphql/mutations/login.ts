import { gql } from '@apollo/client';

const LOGIN = gql`
  mutation login($input: LoginInput!) {
    login(input: $input) {
      __typename
      ...on LoginSuccess {
        user {
          id
          username
          unverifiedEmail
          isVerifiedEmail
        }
        accessToken
        refreshToken
        expiresIn
        tokenType
      }
      ...on LoginError {
        message
        code
      }
    }
  }
`
export default LOGIN;
