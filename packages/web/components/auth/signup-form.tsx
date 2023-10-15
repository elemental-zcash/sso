
import { InputField, AutoTextArea, TextInput, Button } from '@elemental-zcash/components';
import { Box, Text } from 'elemental-react';
import { Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { ApolloError, gql, useMutation } from '@apollo/client';

import client from '../../apollo-client';

import { FormTextInput } from '../common';

import PasswordField from './PasswordField';
import SIGNUP from '../../graphql/mutations/signup';
import { getErrorCode } from '../../graphql/utils';
import SEND_VERIFICATION_EMAIL from '../../graphql/mutations/send-verification-email';
// import { useQuery } from 'react-query';
import { config } from '../../config';
import { SignupType } from './constants';
import { useRouter } from 'next/router';


const makeSchema = (requiresZcashaddress = false) => Yup.object().shape({
  ...(requiresZcashaddress && { zcashaddress: Yup.string()
    .matches(/^[a-z0-9]+$/, { message: 'Must be alphanumeric'})
    // .case('lower')
    .matches(/^(zs)|(ua)/, { message: 'Not a valid sapling or unified address'})
    .min(10, 'Too short')
    .max(150, 'Too long')
    .required('Required')
  }),
  email: Yup.string()
    .email('Invalid email')
    .required('Required'),
    // .when('zcashaddress', {
    //   is: address => !address, // alternatively: (val) => val == true
    //   then: (schema) => schema.email('Invalid email').required('Required'),
    //   // otherwise: (schema) => schema,
    // }),
  password: Yup.string()
    .min(8, 'Too short!')
    .max(999, 'Too long!')
    .required('Required'),
});

const SignupSchema = makeSchema();
const SignupWithZcashSchema = makeSchema(true);

enum SignupStage {
  SIGNUP = 'SIGNUP',
  VERIFY_EMAIL = 'VERIFY_EMAIL',
  SUCCESS = 'SUCCESS',
};

interface SignupInput {
  zcashaddress?: string,
  email?: string,
  password: string,
}
interface SignupSuccess {
  __typename: 'SignupSuccess'
  user: {
    id: string,
    username: string,
    unverifiedEmail: string,
  },
  code: string
}
interface SignupError { __typename: 'SignupError', message: string, code: string };




const getToken = async (code) => {
  const res = await fetch(`${config.OAUTH_URL}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      'grant_type': 'authorization_code',
      'client_id': 'sso-api',
      'code': code,
    }),
  });
  const { access_token, refresh_token, expires_in, token_type } = await res.json();

  localStorage.setItem('accessToken', access_token);
  localStorage.setItem('refreshToken', refresh_token);
  localStorage.setItem('expiresIn', expires_in);
  localStorage.setItem('tokenType', token_type);
}

const SignupForm = () => {
  const router = useRouter();
  const [signupStage, setSignupStage] = useState(SignupStage.SIGNUP);
  const [signup, { data, loading, error }] = useMutation<{ signup: SignupSuccess | SignupError }, { input: SignupInput }>(SIGNUP);
  const [sendVerificationEmail, { data: verificationData, loading: verificationLoading, error: verificationError }] = useMutation<{ sendVerificationEmail: boolean }, { address: string }>(SEND_VERIFICATION_EMAIL);
  const { code: errorCode, message: errorMessage }: { code?: string, message?: string } = getErrorCode(error, data?.signup as SignupError);
  const [signupType, setSignupType] = useState(SignupType.EMAIL);

  const user = (data?.signup as SignupSuccess)?.user;
  const authCode = user?.id && (data?.signup as SignupSuccess)?.code;
  
  // useQuery()


  return (
    <Box borderWidth={1} borderColor="#e2e2f2" borderRadius={4} p={40} flex={1}>
      <Formik
        initialValues={{
          ...(signupType === SignupType.ZCASH && { zcashaddress: '' }),
          email: '',
          password: ''
        }}
        validationSchema={signupType === SignupType.ZCASH ? SignupWithZcashSchema : SignupSchema} //@ts-ignore
        onSubmit={async (values) => {
          try {
            const input: SignupInput = {
              password: values.password,
            };
            if (signupType === SignupType.ZCASH) {
              input.zcashaddress = values.zcashaddress;
            }
            if (signupType === SignupType.EMAIL) {
              input.email = values.email;
            }

            const { data, errors } = await signup({ variables: { input }});
            // console.log({ data });
            if (!data || errors) {
              return;
            }
            if (data?.signup.__typename === 'SignupSuccess') {
              const { user } = data.signup;
              if (!user?.username) {
                return; // :(
              }
              // await getToken(data?.signup?.code);

              setSignupStage(SignupStage.SUCCESS);
              const { data: verifyEmail, errors: emailErrors } = await sendVerificationEmail({ variables: { address: data.signup.user.unverifiedEmail }})
              if (!verifyEmail || emailErrors) {
                return;
              }
            }
          } catch (err) {
            console.log({ err });
          }

          // setSignupStage(SignupStage.VERIFY_EMAIL);
        }}
      >
        {({ values, setFieldValue, errors, touched, handleChange, handleSubmit }) => (
          <>
            {{
              [SignupStage.SIGNUP]: (
                <Box>
                  <Text center bold fontSize={24} mb={3}>Register</Text>
                  {(error || errorCode || errorMessage) && (
                    <Box>
                      <Text mb={20} color="error">{`Error: ${error?.message || errorMessage || errorCode}`}</Text>
                    </Box>
                  )}
                  {signupType === SignupType.ZCASH && (
                    <Box>
                      <InputField
                        width="100%"
                        label="Zcash Address (keep viewing and private key private)"
                        error={touched.zcashaddress && errors.zcashaddress}
                        value={values.zcashaddress}
                      >
                        {({ value }) =>
                          <FormTextInput
                            label="Zcash Address"
                            value={value}
                            onChange={handleChange('zcashaddress')}
                          />
                        }
                      </InputField>
                    </Box>
                  )}
                  <Box>
                    <InputField
                      width="100%"
                      label="Email"
                      error={touched.email && errors.email}
                      value={values.email}
                    >
                      {({ label, value }) =>
                        <FormTextInput
                          label={label}
                          value={value}
                          onChange={handleChange('email')}
                        />
                      }
                    </InputField>
                  </Box>
                  <Box>
                    <PasswordField
                      error={touched.password && errors.password}
                      value={values.password}
                      label="Password"
                      onChange={handleChange('password')}
                    />
                  </Box>
                  <Button mb={16} onPress={handleSubmit} m={0} disabled={(touched.email || touched.password) && Object.keys(errors).length > 0}>SIGN UP</Button>
                  {signupType !== SignupType.ZCASH && <Button disabled outlined color="primary" /*onPress={() => { setSignupType(SignupType.ZCASH) }}*/ m={0}>SIGN UP WITH ZCASH</Button>}
                  {signupType !== SignupType.EMAIL && <Button outlined color="primary" onPress={() => { setSignupType(SignupType.EMAIL) }} m={0}>SIGN UP WITH EMAIL</Button>}
                </Box>
              ),
              [SignupStage.VERIFY_EMAIL]: (
                <Box justifyContent="center" alignItems="center">
                  <Text center bold fontSize={24} mb={3}>Check Your Email</Text>
                  <Text>
                    {'We sent a verification link to '}
                    <Text as="span" bold>{values.email}</Text>
                  </Text>
                </Box>
              ),
              [SignupStage.SUCCESS]: (
                <Box justifyContent="center" alignItems="center">
                  <Text center bold fontSize={24} mb={3}>Success!</Text>
                  <Text center bold fontSize={20} mb={2}>Your Account ID is: {(data?.signup as SignupSuccess)?.user.username}</Text>
                  <Text center bold fontSize={16} mb={2}>You will need it to login (email verification/login is disabled for now)</Text>
                  <Button
                    mb={16}
                    onPress={() => {
                      const routerOptions = {
                        pathname: '/auth/login',
                        query: {
                          username: (data?.signup as SignupSuccess)?.user.username,
                        } as { username: string, scope?: string, client_id?: string, callback_uri: string }
                      };

                      if (router.query.callback_uri) {
                        const { scope, client_id, callback_uri } = router.query;

                        routerOptions.query.scope = scope as string;
                        routerOptions.query.client_id = client_id as string;
                        routerOptions.query.callback_uri = callback_uri as string;
                      }
                      router.push(routerOptions);
                    }}
                    m={0}
                    disabled={(touched.email || touched.password) && Object.keys(errors).length > 0}
                  >
                    LOGIN
                  </Button>
                </Box>
              ),
            }[signupStage]}
          </>
        )}
        </Formik>
    </Box>
  );
};

export default SignupForm;
