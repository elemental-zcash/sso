import Head from 'next/head';
import Link from 'next/link';
import { Box, Text, Row } from 'elemental-react';
import { Button } from '@elemental-zcash/components';
import InputField from '@elemental-zcash/components/lib/forms/InputField';
import TextInput from '@elemental-zcash/components/lib/forms/TextInput';

import Section from '../../components/Section';
import ResetPasswordForm from '../../components/auth/reset-password-form';


export default function Signup() {
  return (
    <Box flex={1} justifyContent="center" alignItems="center" minHeight="100vh">
      <Head>
        <title>Elemental Zcash SSO</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Section width="100%" maxWidth={640}>
        <ResetPasswordForm />
        <Box mt={20} alignItems="center">
          <Row flex={1}>
            <Link href="/auth/login">
              <Text color="blue" style={{ display: 'inline', cursor: 'pointer' }}>Back to Sign In</Text>
            </Link>
          </Row>
        </Box>
      </Section>
    </Box>
  )
}
