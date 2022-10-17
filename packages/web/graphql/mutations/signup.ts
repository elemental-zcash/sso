import { gql } from '@apollo/client';

const SIGNUP = gql`
  mutation signup($input: SignupInput!) {
    signup(input: $input) {
      __typename
      ...on SignupSuccess {
        user {
          id
          username
          unverifiedEmail
        }
        code
      }
      ...on SignupError {
        message
        code
      }
    }
  }
`
export default SIGNUP;
