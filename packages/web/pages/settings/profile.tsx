import Head from 'next/head';
import Link from 'next/link';
import { Box, Row } from 'elemental-react';
import { AutoTextArea, Button, TextInput, InputField } from '@elemental-zcash/components';

import { Text, TextLink, Section } from '#components';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';

import GET_VIEWER from '../../graphql/queries/viewer';
import { Viewer, ViewerNotFoundError } from '../../hooks/use-viewer';
import VerifyEmailLoginBox from '../../components/auth/verify-email-login-box';
import SEND_VERIFICATION_EMAIL from '../../graphql/mutations/send-verification-email';
import { Formik } from 'formik';
import { getErrorCode } from '../../graphql/utils';
import UPDATE_USER from '../../graphql/mutations/update-user';
// import RegisterForm from '../components/register/register-form';

interface UpdateUserSuccess {
  user: {
    id: string,
    socials: {
      twitter: string,
      youtube: string,
    },
  }
}

interface UpdateUserError {
  message: string,
  code: string,
}


export default function ProfileSettings() {
  const { loading, data, error, client } = useQuery<{ viewer: Viewer | ViewerNotFoundError }>(GET_VIEWER);
  const [updateUser, { loading: loadingUpdateUser, data: updateUserData, error: updateUserError }] = useMutation<{ updateUser: UpdateUserSuccess | UpdateUserError }>(UPDATE_USER);

  const { code: errorCode, message: errorMessage }: { code?: string, message?: string } = getErrorCode(error, data?.viewer as ViewerNotFoundError);

  const userData = data?.viewer?.__typename === 'Viewer' && data.viewer.user;

  // const [sendVerificationEmail, { data: verificationData, loading: verificationLoading, error: verificationError }] = useMutation<{ sendVerificationEmail: boolean }, { address: string }>(SEND_VERIFICATION_EMAIL);
  const apolloClient = useApolloClient();


  return (
    <Box flex={1} justifyContent="center" alignItems="center" minHeight="100vh">
      <Head>
        <title>Elemental Zcash SSO</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Section width="100%" maxWidth={640}>
        {/* <RegisterForm /> */}
        <Box mt={20} alignItems="center">
          {data?.viewer?.__typename === 'Viewer' && data?.viewer?.userId ? (
            <Box>
              {(data.viewer.user.isVerifiedEmail || true) ? (
                <Box>
                  <Text fontSize={24} bold mb={20}>
                    Settings
                  </Text>
                  <Formik
                    initialValues={{
                      name: userData?.name || '', bio: userData?.bio || '',
                      username: userData?.username || '', twitter: userData?.socials?.twitter || '', youtube: userData?.socials?.youtube,
                      instagram: userData?.socials?.instagram || '', website: userData?.socials?.website || '',
                      zcashaddress: userData?.zcashaddress }}
                    // validate={(values) => {
                    //   const errors = {};

                    //   return errors;
                    // }}
                    // validationSchema={LoginSchema}
                    onSubmit={async (values) => {
                      const { data: _ } = await updateUser({
                        variables: {
                          input: {
                            id: (data.viewer as Viewer).user.id,
                            user: { name: values.name, bio: values.bio,
                              username: values.username, twitter: values.twitter, youtube: values.youtube,
                              instagram: values.instagram, zcashaddress: values.zcashaddress, website: values.website,
                            }
                          },
                        },
                      }) 
                      // await updateUser({
                      //   variables: {}
                      // });
                      // const { data: mutationData, errors } = await login({
                      //   variables: { input: { email: values.email, password: values.password } },
                      // });
                      // if (!errors && mutationData?.login?.__typename === 'LoginSuccess') {
                      //   const loginUser = mutationData.login.user;
                      //   const loginCode = mutationData.login.code;

                      //   if (loginCode) {
                      //     await getToken(loginCode);
                      //   }
                      // } 
                    }}
                  >
                    {({ values, setFieldValue, errors, touched, handleChange, handleSubmit }) => (
                      <Box flex={1}>
                        {/* <Text center bold fontSize={24} mb={3}>Welcome Back</Text> */}
                        {(error || errorCode || errorMessage) && (
                          <Box>
                            <Text mb={20} color="error">{`Error: ${error?.message || errorMessage || errorCode}`}</Text>
                          </Box>
                        )}
                        {[
                          { id: 'name', label: 'Name' },
                          { id: 'username', label: 'Username' },
                          { id: 'zcashaddress', label: 'Zcash Address' },
                          { id: 'bio', label: 'Bio' },
                          { id: 'website', label: 'Website' },
                          { id: 'twitter', label: 'Twitter Username' },
                          { id: 'youtube', label: 'YouTube' },
                          { id: 'instagram', label: 'Instagram' },
                        ].map(({ id, label }) => (
                          <Box key={id}>
                            <InputField
                              width="100%"
                              label={label}
                              error={touched[id] && errors[id]}
                              value={values[id]}
                            >
                              {({ label, value }) =>
                                (id === 'bio') ? (
                                  <AutoTextArea
                                    onChangeText={text => setFieldValue(id, text)}
                                    placeholder={label}
                                    // label={label}
                                    // error={touched[id] && errors[id]}
                                    value={values[id]}
                                  />
                                ) : (
                                  <TextInput
                                  placeholder={label}
                                  // @ts-ignore
                                  value={value}
                                  onChange={handleChange(id)}
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
                                )
                              }
                            </InputField>
                          </Box>
                        ))}
                        {/* {[
                          { id: 'name', label: 'Name' },
                          { id: 'username', label: 'Username' },
                          { id: 'zcashaddress', label: 'Zcash Address' },
                          { id: 'bio', label: 'Bio' },
                          { id: 'website', label: 'Website' },
                          { id: 'twitter', label: 'Twitter Username' },
                          { id: 'youtube', label: 'YouTube' },
                          { id: 'instagram', label: 'Instagram' },
                          // { id: 'instagram', label: 'Instagram' },
                          ].map(({ id, label: fieldLabel }) => (
                            <Box flex={1}>
                              <InputField
                                width="100%"
                                label={fieldLabel}
                                error={touched[id] && errors[id]}
                                value={values[id]}
                              >
                                {({ label, value }) =>
                                  {(
                                    <TextInput
                                      // as=""
                                      placeholder={label}
                                      // @ts-ignore
                                      value={value}
                                      onChange={handleChange(id)}
                                      pb={0}
                                      px={3}
                                      borderWidth={1}
                                      borderRadius={4}
                                      height={40}
                                      borderColor="#e2e2f2"
                                    />
                                  )
                                }}
                              </InputField>
                            </Box>
                          ))} */}
{/*                         
                        <Box>
                          <PasswordField
                            error={touched.password && errors.password}
                            value={values.password}
                            label="Password"
                            onChange={handleChange('password')}
                          />
                        </Box> */}
                        <Box>
                          <Link href="/">
                            <TextLink m={0} mb={20} color="blue">
                              {'< Back to home'}
                            </TextLink>
                          </Link>
                          <Button style={{ cursor: 'pointer' }} onPress={handleSubmit} m={0} minWidth={128}>UPDATE PROFILE</Button>
                        </Box>
                      </Box>
                    )}
                  </Formik>
                </Box>
              ) : (
                <>
                </>
              )}
            </Box>
          ) : (
            <Row flex={1}>
              <Text style={{ display: 'inline' }}>
                {'Redirecting to Login'}
                {/* <Link href="/auth/login">
                  <Text color="blue" style={{ display: 'inline' }}>Sign In</Text>
                </Link> */}
              </Text>
            </Row>
          )}
        </Box>
      </Section>
    </Box>
  )
}
