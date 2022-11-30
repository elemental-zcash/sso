import { gql } from '@apollo/client';

const SEND_VERIFICATION_EMAIL = gql`

  mutation sendVerificationEmail($address: String!) {
    sendVerificationEmail(address: $address)
  }
`
export default SEND_VERIFICATION_EMAIL;
