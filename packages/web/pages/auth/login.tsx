import Head from 'next/head';
import Link from 'next/link';
import { Box, Text, Row } from 'elemental-react';
import { Button } from '@elemental-zcash/components';
import InputField from '@elemental-zcash/components/lib/forms/InputField';
import TextInput from '@elemental-zcash/components/lib/forms/TextInput';
import { useRouter } from 'next/router';
import { Section, TextLink } from '#components';

import LoginForm from '../../components/auth/login-form';


export default function Signup() {
  const router = useRouter();

  return (
    <Box flex={1} justifyContent="center" alignItems="center" minHeight="100vh">
      <Head>
        <title>Elemental Zcash SSO</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Section width="100%" maxWidth={640}>
        <LoginForm key={String(router.query.username)} router={router} username={router.query.username as string} />
        <Box mt={20} alignItems="center">
          <Row flex={1}>
            <Text style={{ display: 'inline' }}>
              {'Don’t have an account? '}
              <Link href="/auth/signup">
                <TextLink as="span" color="blue">Sign Up</TextLink>
              </Link>
            </Text>
          </Row>
        </Box>
      </Section>
    </Box>
  )
}
