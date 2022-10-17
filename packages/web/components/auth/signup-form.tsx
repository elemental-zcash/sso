import { InputField, AutoTextArea, TextInput, Button } from '@elemental-zcash/components';
import { Box, Text } from 'elemental-react';
import { Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { ApolloError, gql, useMutation } from '@apollo/client';

import client from '../../apollo-client';

import PasswordField from './PasswordField';
import SIGNUP from '../../graphql/mutations/signup';
import { getErrorCode } from '../../graphql/utils';
import SEND_VERIFICATION_EMAIL from '../../graphql/mutations/send-verification-email';
import { useQuery } from 'react-query';

const SignupSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string()
    .min(8, 'Too short!')
    .max(999, 'Too long!')
    .required('Required'),
});

enum SignupStage {
  SIGNUP = 'SIGNUP',
  VERIFY_EMAIL = 'VERIFY_EMAIL',
};

interface SignupInput {
  email: string,
  password: string,
}
interface SignupSuccess {
  __typename: 'SignupSuccess'
  user: {
    id: string,
    unverifiedEmail: string,
  },
  code: string
}
interface SignupError { __typename: 'SignupError', message: string, code: string };


const getToken = async (code) => {
  const res = await fetch('https://api.elemental-sso.local/oauth/token', {
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

const RegisterForm = () => {
  const [signupStage, setSignupStage] = useState(SignupStage.SIGNUP);
  const [signup, { data, loading, error }] = useMutation<{ signup: SignupSuccess | SignupError }, { input: SignupInput }>(SIGNUP);
  const [sendVerificationEmail, { data: verificationData, loading: verificationLoading, error: verificationError }] = useMutation<{ sendVerificationEmail: boolean }, { address: string }>(SEND_VERIFICATION_EMAIL);
  const { code: errorCode, message: errorMessage }: { code?: string, message?: string } = getErrorCode(error, data?.signup as SignupError);

  const user = (data?.signup as SignupSuccess)?.user;
  const authCode = user?.id && (data?.signup as SignupSuccess)?.code;
  
  // useQuery()


  return (
    <Box borderWidth={1} borderColor="#e2e2f2" borderRadius={4} p={40} flex={1}>
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={SignupSchema}
        // validate={(values) => {
        //   const errors = {};

        //   return errors;
        // }}
        onSubmit={async (values) => {
          try {
            // const { } = await client.mutate({
            //   mutation: signup,
            // })
            const { data, errors } = await signup({ variables: { input: { email: values.email, password: values.password } }});
            if (!data || errors) {
              return;
            }
            if (data?.signup.__typename === 'SignupSuccess') {
              if (!data?.signup?.user?.unverifiedEmail || !data?.signup?.code) {
                return; // :(
              }
              await getToken(data?.signup?.code);

              setSignupStage(SignupStage.VERIFY_EMAIL);
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
                  <Box>
                    <InputField
                      width="100%"
                      label="Email"
                      error={touched.email && errors.email}
                      value={values.email}
                    >
                      {({ label, value }) =>
                        <TextInput
                          placeholder={label}
                          // @ts-ignore
                          value={value}
                          onChange={handleChange('email')}
                          pb={0}
                          px={3}
                          borderWidth={1}
                          borderRadius={4}
                          height={40}
                          borderColor="#e2e2f2"
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
                  <Button onPress={handleSubmit} m={0}>SIGN UP</Button>
                </Box>
              ),
              [SignupStage.VERIFY_EMAIL]: (
                <Box justifyContent="center" alignItems="center">
                  <Text center bold fontSize={24} mb={3}>Check Your Email</Text>
                  <Text>
                    {'We sent a verification link to '}
                    <Text bold>{values.email}</Text>
                  </Text>
                </Box>
              )
            }[signupStage]}
          </>
        )}
        </Formik>
    </Box>
  );
};

export default RegisterForm;
