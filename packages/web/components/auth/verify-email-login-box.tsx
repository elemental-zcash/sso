import { Box } from 'elemental-react';
import React from 'react';
import { Text, TextLink } from '../common';

export default function VerifyEmailLoginBox({ email, onPressResend }) {
  return (
    <Box alignItems="center" justifyContent="center">
      <Text center bold fontSize={24} mb={3}>Check your email</Text>
      <Text mb={12}>We sent a verification link to{'\n'}{email}</Text>
      <Text>
        {'Didn’t receive the email? '}
        <TextLink onClick={onPressResend} underline color="blue">
          Click to resend
        </TextLink>
      </Text>
    </Box>
  )
}
