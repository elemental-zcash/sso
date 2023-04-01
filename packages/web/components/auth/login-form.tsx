import React, { useEffect, useState } from 'react';
import { InputField, AutoTextArea, TextInput, Button } from '@elemental-zcash/components';
import { TextButton as _TextButton } from '@elemental-zcash/components/lib/buttons';
import { Box, Row } from 'elemental-react';
import { Formik } from 'formik';
import Link from 'next/link';
import * as Yup from 'yup';

import { Text, TextLink } from '../common';
import PasswordField from './PasswordField';
import { useMutation } from '@apollo/client';
import LOGIN from '../../graphql/mutations/login';
import { getErrorCode } from '../../graphql/utils';
import VerifyEmailLoginBox from './verify-email-login-box';
import SEND_VERIFICATION_EMAIL from '../../graphql/mutations/send-verification-email';
import { useRouter } from 'next/router';
import { config } from '../../config';
import { SignupType } from './constants';

enum LoginStage {
  LOGIN = 'LOGIN',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  LOGGED_IN = 'LOGGED_IN',
};

interface LoginSuccess {
  __typename: 'LoginSuccess',
  user: {
    id: string,
    isVerifiedEmail: boolean,
  },
  // code: string,
  accessToken: string,
  refreshToken: string,
  expiresIn: String,
  tokenType: 'Bearer',
};
interface LoginError {
  __typename: 'LoginError',
  message: string,
  code: string,
};

enum LoginResponse {
  LoginSuccess = 'LoginSuccess',
  LoginError = 'LoginError',
}

const LoginSchema = Yup.object().shape({
  username: Yup
    .string().min(16).max(16)
    .when(['email'], {
      is: (email) => Boolean(!email),
      then: Yup.string().required("Required")
    }),
  // zcashaddress: Yup
  //   .string().min(16).max(16)
  //   .when(['email', 'username'], {
  //     is: (email, username) => Boolean(!username && !email),
  //     then: Yup.string().required("Required")
  //   }),
  zcashaddress: Yup
    .string().min(16),
  email: Yup
    .string()
    .email('Invalid email')
    .when(['username'], {
      is: (username) => Boolean(!username),
      then: Yup.string().required("Required")
    }),
    // .required('Required'),
  password: Yup.string()
    .min(8, 'Too short!')
    .max(999, 'Too long!')
    .required('Required'),
}, [['username', 'email']]);

const FormTextInput = ({ label, value, onChange, ...props }) => (
  <TextInput
    placeholder={label}
    // @ts-ignore
    value={value}
    onChange={onChange}
    pb={0}
    px={3}
    borderWidth={1}
    borderRadius={4}
    height={40}
    borderColor="#e2e2f2"
    {...props}
  />
);


interface LoginInput {
  email: string,
  password: string,
}

const TextButton = _TextButton as typeof Button;

const saveToken = (token) => {
  const { accessToken, refreshToken, expiresIn, tokenType } = token;
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('expiresIn', expiresIn);
  localStorage.setItem('tokenType', tokenType);
}

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

  saveToken({ accessToken: access_token, refreshToken: refresh_token, expiresIn: expires_in, tokenType: token_type });
}

const LoginForm = () => {
  const router = useRouter();
  const [loginStage, setLoginStage] = useState(LoginStage.LOGIN);
  const [signupType, setSignupType] = useState(SignupType.ACCOUNT_ID);
  const [login, { data, loading, error, }] = useMutation<{ login: LoginSuccess | LoginError }, { input: LoginInput }>(LOGIN, {
    onCompleted: (result) => {
      if (result.login.__typename === LoginResponse.LoginError) {
        return;
      }
      const { user } = result.login;
      if (!user.isVerifiedEmail) {
        setLoginStage(LoginStage.EMAIL_VERIFICATION);
      } else {
        router.push('/');
      }
    },
    // errorPolicy: 'all',
  });
  const [sendVerificationEmail, { data: verificationData, loading: verificationLoading, error: verificationError }] = useMutation<{ sendVerificationEmail: boolean }, { address: string }>(SEND_VERIFICATION_EMAIL);

  const { code: errorCode, message: errorMessage }: { code?: string, message?: string } = getErrorCode(error, data?.login as LoginError);
  
  useEffect(() => {
    
  }, []);

  const successData = (data?.login.__typename === LoginResponse.LoginSuccess) && data.login;
  const errorData = (data?.login.__typename === LoginResponse.LoginError) && data.login;
  
  // useMutation()
  // useGraphql(...)

  return (
    <Box borderWidth={1} borderColor="#e2e2f2" borderRadius={4} p={40} flex={1}>
      <Formik
        initialValues={{ email: '', username: '', password: '', zcashaddress: '' }}
        // validate={(values) => {
        //   const errors = {};

        //   return errors;
        // }}
        validationSchema={LoginSchema}
        onSubmit={async (values) => {
          const args: { variables: any } = {
            variables: { input: { password: values.password } },
          }
          if (values.email) {
            args.variables.input.email = values.email;
          }
          if (values.username) {
            args.variables.input.username = values.username;
          }
          const { data: mutationData, errors } = await login(args);
          if (!errors && mutationData?.login?.__typename === 'LoginSuccess') {
            const loginUser = mutationData.login.user;
            const { accessToken, refreshToken, expiresIn, tokenType } = mutationData.login; 
            // const loginCode = mutationData.login.code;

            // if (loginCode) {
            //   await getToken(loginCode);
            // }
            if (accessToken) {
              await saveToken({ accessToken, refreshToken, expiresIn, tokenType });
            }
          } 
        }}
      >
        {({ values, setFieldValue, errors, touched, handleChange, handleSubmit }) => (
          <Box>
            {{
              [LoginStage.LOGIN]: (
                <>
                  <Text center bold fontSize={24} mb={3}>Welcome Back</Text>
                  {(error || errorCode || errorMessage) && (
                    <Box>
                      <Text mb={20} color="error">{`Error: ${error?.message || errorMessage || errorCode}`}</Text>
                    </Box>
                  )}
                  {signupType === SignupType.ACCOUNT_ID && (
                    <Box>
                      <InputField
                        width="100%"
                        label="Account ID"
                        error={touched.username && errors.username}
                        value={values.username}
                      >
                        {({ value, label }) =>
                          <FormTextInput
                            label={label}
                            value={value}
                            onChange={handleChange('username')}
                          />
                        }
                      </InputField>
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
                  {signupType === SignupType.EMAIL && (
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
                            // onChangeText={(text) => {
                            //   setFieldValue('username', text);
                            // }}
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
                  )}
                  <Box>
                    <PasswordField
                      error={touched.password && errors.password}
                      value={values.password}
                      label="Password"
                      onChange={handleChange('password')}
                    />
                  </Box>
                  <Row justifyContent="space-between">
                    <Link href="/auth/forgot-password">
                      <TextButton m={0} color="blue" style={{ cursor: 'pointer' }}>
                        Forgot Password?
                      </TextButton>
                    </Link>
                    <Button onPress={handleSubmit} m={0} minWidth={128}>SIGN IN</Button>
                  </Row>
                  <Box py={20}>
                    {signupType !== SignupType.EMAIL && <Button mb={20} outlined color="primary" onPress={() => { setSignupType(SignupType.EMAIL) }} m={0}>SIGN IN WITH EMAIL</Button>}
                    {signupType !== SignupType.ACCOUNT_ID && <Button mb={20} outlined color="primary" onPress={() => { setSignupType(SignupType.ACCOUNT_ID) }} m={0}>SIGN IN WITH ACCOUNT ID</Button>}
                    {signupType !== SignupType.ZCASH && <Button mb={20} outlined color="primary" onPress={() => { setSignupType(SignupType.ZCASH) }} m={0}>SIGN IN WITH ZCASH</Button>}
                  </Box>
                </>
              ),
              [LoginStage.EMAIL_VERIFICATION]: (
                <VerifyEmailLoginBox email={values.email} onPressResend={async () => {
                  if (values.email && !errors.email) {
                    const { data: mutationData, errors } = await sendVerificationEmail({ variables: { address: values.email }});

                    // if (!errors && mutationData?.sendVerificationEmail) {
                    //   router.push('/');
                    // }
                  }
                }} />
              ),
              [LoginStage.LOGGED_IN]: (
                <Box>
                  <Text>You are now logged in!</Text>
                </Box>
              )
            }[loginStage]}
          </Box>
        )}
      </Formik>
    </Box>
  );
};

export default LoginForm;
