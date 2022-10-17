import Head from 'next/head';
import Link from 'next/link';
import { Box, Text, Row } from 'elemental-react';
import { Button } from '@elemental-zcash/components';
import InputField from '@elemental-zcash/components/lib/forms/InputField';
import TextInput from '@elemental-zcash/components/lib/forms/TextInput';

import Section from '../../components/Section';
import SignupForm from '../../components/auth/signup-form';


export default function Signup() {
  return (
    <Box flex={1} justifyContent="center" alignItems="center" minHeight="100vh">
      <Head>
        <title>Elemental Zcash SSO</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Section width="100%" maxWidth={640}>
        <SignupForm />
        <Box mt={20} alignItems="center">
          <Row flex={1}>
            <Text style={{ display: 'inline' }}>
              {'Already have an account? '}
              <Link href="/auth/login">
                <Text color="blue" style={{ display: 'inline', cursor: 'pointer' }}>Sign In</Text>
              </Link>
            </Text>
          </Row>
        </Box>
      </Section>
    </Box>
  )
}
