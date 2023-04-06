import Head from 'next/head';
import Link from 'next/link';
import { Box, Text, Row } from 'elemental-react';
import { Button } from '@elemental-zcash/components';
import InputField from '@elemental-zcash/components/lib/forms/InputField';
import TextInput from '@elemental-zcash/components/lib/forms/TextInput';

import Section from '../../components/Section';
import SignupForm from '../../components/auth/signup-form';
import { useRouter } from 'next/router';
import GET_VIEWER from '../../graphql/queries/viewer';
import { useQuery } from '@apollo/client';
import useViewer from '../../hooks/use-viewer';
import { useEffect } from 'react';


export default function Signup() {
  const router = useRouter();
  const { loading, viewer } = useViewer();
  // const { loading, data, error, client } = useQuery<{ viewer: Viewer | ViewerNotFoundError }>(GET_VIEWER);

  useEffect(() => {
    if (loading) {
      return;
    }
    if ((viewer.__typename === 'Viewer') && viewer?.user.id) {
      if (router.query.callback_uri) {
        const { scope, client_id, callback_uri } = router.query;
        router.push({
          pathname: '/oauth/authorize',
          query: {
            response_type: 'code',
            scope,
            client_id,
            redirect_uri: `${callback_uri}/auth/callback`,
          }
        })
      } else {
        router.push('/');
      }
    }
  }, [viewer])

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
