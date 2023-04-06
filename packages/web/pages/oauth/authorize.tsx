import React, { useEffect } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { Box, Text } from 'elemental-react';
import Head from 'next/head';
import Section from '../../components/Section';
import { getErrorCode } from '../../graphql/utils';
import { Button } from '@elemental-zcash/components';

interface CheckAuthorizeError {
  __typename: 'CheckAuthorizeError',
  message: string,
  code: string,
};
  

const AUTHORIZE_MUTATION = gql`
  mutation GetAuthorizationCode($input: AuthCodeGrantInput!, $confirm: Boolean!) {
    authorize(input: $input, confirm: $confirm) {
      code
      redirectUri
    }
  }
`;

const CHECK_AUTHORIZATION_MUTATION = gql`
  query Authorize($input: AuthCodeGrantInput!) {
    checkAuthorizationGrant(input: $input) {
      client {
        clientId
        clientName
      }
      request {
        scope
      }
    }
  }
`;

function AuthorizePage({ ...props }) {
  const router = useRouter();
  const { client_id, redirect_uri, scope, state } = router.query;

  const [confirm, setConfirm] = React.useState(false);
  const [authorize, { loading, error }] = useMutation(AUTHORIZE_MUTATION);
  const { data, loading: checkLoading, error: checkError } = useQuery(CHECK_AUTHORIZATION_MUTATION, {
    variables: { input: { clientId: client_id, redirectUri: redirect_uri, scope }},
  });

  const { code: errorCode, message: errorMessage }: { code?: string, message?: string } = getErrorCode(error, data?.checkAuthorizationGrant as CheckAuthorizeError);

  const client = data?.checkAuthorizationGrant?.client;
  const user = data?.checkAuthorizationGrant?.user;
  const grantRequest = data?.checkAuthorizationGrant?.request;
  // const { client, request } = data || ;

  function handleSubmit(event?) {
    if (event?.preventDefault) {
      event.preventDefault();
    }
    authorize({
      variables: { input: { clientId: client_id, redirectUri: redirect_uri, scope }, confirm: true },
      onCompleted: (data) => {
        // Perform your callback action here using the data returned by the mutation
        // console.log('Authorization code:', data.authorize.code);
        // console.log('Redirect URI:', data.authorize.redirectUri);
        // window.location.href = data.authorize.redirectUri;
        router.replace(`${data.authorize.redirectUri}?code=${data.authorize.code}`)
      },
    });
  }
  
  useEffect(() => {
    if (checkError?.message?.toLowerCase().includes('unauthorized')) {
      router.push(`/auth/login?callback_uri=${redirect_uri}&scope=${scope}&client_id=${client_id}`)
    }
  }, [checkError]);

  // useEffect(() => {
  //   checkAuthorizationGrant();
  // }, []);

  return (
    <Box flex={1} justifyContent="center" alignItems="center" minHeight="100vh">
      <Head>
        <title>Elemental Zcash SSO</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Section width="100%" maxWidth={640}>
        {/* <RegisterForm /> */}
        <Box borderWidth={1} borderColor="#e2e2f2" borderRadius={4} p={40} flex={1}>
          {checkLoading ? (
            <Text>Loading...</Text>
          ) : (
            <>
              {(error || errorCode || errorMessage) && (
                <Box>
                  <Text mb={20} color="error">{`Error: ${error?.message || errorMessage || errorCode}. Please try again.`}</Text>
                </Box>
              )}
              <Text fontFamily="IBM Plex Sans" fontSize={30} lineHeight={36} mb={20} bold>Sign-in with <strong>Elemental Zcash SSO</strong></Text>
              <Text fontFamily="IBM Plex Sans" fontSize={20} lineHeight={24} mb={16}><strong>{'Elemental Pay' || client?.clientName}</strong> will get access to: <strong>{grantRequest?.scope}</strong></Text>

              {user?.username && <Text fontFamily="IBM Plex Sans">You are signed in as {user.username}</Text>}
              {/* <form onSubmit={handleSubmit}> */}
                {/* <label>
                  <input
                    type="checkbox"
                    checked={confirm}
                    onChange={(e) => setConfirm(e.target.checked)}
                    style={{ appearance: 'auto' }}
                  />
                  <span>Consent?</span>
                </label> */}
                {/* {!user && (
                <div>
                    <p>You haven't logged in. Log in with:</p>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                )} */}
                {/* <button type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit'}
                </button> */}
              {/* </form> */}
              <Button
                onPress={() => {
                //   setConfirm(true);
                  handleSubmit()
                }}
              >Authorize</Button>
              {/* {error && <p>An error occurred while submitting the form. Please try again.</p>} */}
            </>
          )}
        </Box>
      </Section>
    </Box>
  );
}

export default AuthorizePage;
