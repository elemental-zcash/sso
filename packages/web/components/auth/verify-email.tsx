import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box } from 'elemental-react';
import Link from 'next/link';
import { Button } from '@elemental-zcash/components';

import { Text } from '../common';
import { useMutation } from '@apollo/client';
import VERIFY_EMAIL from '../../graphql/mutations/verify-email';
import GET_VIEWER from '../../graphql/queries/viewer';

const waitOneSec = () => new Promise((resolve) => {
  setTimeout(() => {
    resolve(null);
  }, 1000);
});

const VerifyEmail = ({}) => {
  const [success, setSuccess] = useState(false);
  // const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<boolean>(true);
  const [verifyEmail, { data, loading, error }] = useMutation<{ verifyEmail: boolean }, { token: string }>(VERIFY_EMAIL);

  const accessToken = (typeof localStorage !== 'undefined') && localStorage.getItem('accessToken')
  const isLoggedIn = Boolean(accessToken !== null);

  const router = useRouter();

  let token = (router.query?.token as string);
  if (Array.isArray(token)) {
    token = token[0];
  }


  // const verifyEmail = async () => {
  //   try {
  //     // await accountsGraphQL.verifyEmail(token);
  //     console.log('verifying');
  //     await waitOneSec();
  //     // setSuccess(true);
  //     // setVerifying(false);
  //   } catch (err) {
  //     setError(err.message);
  //   }
  // };

  useEffect(() => {
    if (token) {
      verifyEmail({
        variables: { token },
        refetchQueries: [{ query: GET_VIEWER }],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // useEffect(() => {}, [data?.verifyEmail]);

  return (
    <Box borderWidth={1} borderColor="#e2e2f2" borderRadius={4} p={40} flex={1}>
      {error && (
        <Box alignItems="center" p={40} justifyContent="center">
          <Text color="red" >{error}</Text>
          <Link href="/auth/login">
            <Button>
              GO TO HOME PAGE
            </Button>
          </Link>
        </Box>
      )}
      {data?.verifyEmail && (
        <Box alignItems="center" justifyContent="center" my={20}>
          <Text fontSize={24} bold center>Email verified</Text>
          <Text>Your email has been verified.</Text>
          {!isLoggedIn ? (
            <>
              <Text>Please click below to sign in.</Text>{/* @ts-ignore */}
              <Link href="/auth/login" style={{ pointer: 'cursor' }}>
                <Button>
                  SIGN IN
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Text>Please click below to return to home.</Text>{/* @ts-ignore */}
              <Link href="/" style={{ pointer: 'cursor' }}>
                <Button>
                  GO TO HOME
                </Button>
              </Link>
            </>
          )}
        </Box>
      )}
      {verifying && !data?.verifyEmail && (
        <Box my={20} width="100%">
          <Text fontSize={24} mb={20} bold center>Verifying email...</Text>
          <Box flex={1} width="100%">
            {[{ width: '100%' }, { width: '70%' }, { width: '80%' }].map(({ width }) => (
              <Box width={width} bg="#f2f2f2" height={20} mb={12} />
            ))}
          </Box>
        </Box>
      )}
      {/* {loading && (
        <Box>
          {[{ width: '100%' }, { width: '70%' }, { width: '80%' }].map(({ width }) => (
            <Box width={width} bg="#f2f2f2" height={20} mb={12} />
          ))}
        </Box>
      )} */}
      {/* <Link href="/">
        <Button>
          Go to Home Page
        </Button>
      </Link> */}
    </Box>
  );
};

export default VerifyEmail;

