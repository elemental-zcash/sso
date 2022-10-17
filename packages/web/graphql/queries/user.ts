import { gql } from '@apollo/client';

const GET_USER = gql`
  query user($id: ID!) {
    user(id: $id) {
      __typename
      ...on User {
        id
        username
        name
        bio
        zcashaddress
        socials {
          youtube
          instagram
          twitter
          website
        }
      }
      ...on UserNotFoundError {
        message
        code
      }
    }
  }
`
export default GET_USER;
