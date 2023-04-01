import React, { useEffect } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { Box, Text } from 'elemental-react';
import Head from 'next/head';
import Section from '../../components/Section';


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

function AuthorizePage({ user }) {
  const router = useRouter();
  const { client_id, redirect_uri, scope, state } = router.query;

  const [confirm, setConfirm] = React.useState(false);
  const [username, setUsername] = React.useState('');
  const [authorize, { loading, error }] = useMutation(AUTHORIZE_MUTATION);
  const { data, loading: checkLoading, error: checkError } = useQuery(CHECK_AUTHORIZATION_MUTATION, {
    variables: { input: { clientId: client_id, redirectUri: redirect_uri, scope }}
  });
  // const { client, request } = data || ;

//   const grant = '123';
  function handleSubmit(event) {
    event.preventDefault();
    authorize({
      variables: { input: { clientId: client_id, redirectUri: redirect_uri, scope }, confirm },
      onCompleted: (data) => {
        // Perform your callback action here using the data returned by the mutation
        console.log('Authorization code:', data.authorize.code);
        console.log('Redirect URI:', data.authorize.redirectUri);
        // window.location.href = data.authorize.redirectUri;
        router.replace(data.authorize.redirectUri)
      },
    });
  }

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
        <Box mt={20} alignItems="center">
          {checkLoading ? (
            <Text>Loading...</Text>
          ) : (
            <>
              <p>
                The application <strong>{data?.checkAuthorizationGrant?.client?.clientName}</strong> is requesting:
                <strong>{` ${data?.checkAuthorizationGrant?.request?.scope}`}</strong>
              </p>
              <p>
                from You - a.k.a. <strong>{user ? user.username : 'Anonymous'}</strong>
              </p>
              <form onSubmit={handleSubmit}>
                <label>
                  <input
                    type="checkbox"
                    checked={confirm}
                    onChange={(e) => setConfirm(e.target.checked)}
                    style={{ appearance: 'auto' }}
                  />
                  <span>Consent?</span>
                </label>
                {/* {!user && (
                <div>
                    <p>You haven't logged in. Log in with:</p>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                )} */}
                <br />
                <button type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit'}
                </button>
              </form>
              {error && <p>An error occurred while submitting the form. Please try again.</p>}
            </>
          )}
        </Box>
      </Section>
    </Box>
  );
}

export default AuthorizePage;
