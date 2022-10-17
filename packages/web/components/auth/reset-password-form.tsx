import { InputField, AutoTextArea, TextInput, Button } from '@elemental-zcash/components';
import { Box, Text } from 'elemental-react';
import { Formik } from 'formik';
import React from 'react';
// import PasswordField from './PasswordField';

const ResetPasswordForm = () => {
  // useGraphql(...)

  return (
    <Box borderWidth={1} borderColor="#e2e2f2" borderRadius={4} p={40} flex={1}>
      <Text center bold fontSize={24} mb={3}>Forgot Your Password?</Text>
      <Formik
        initialValues={{ email: '' }}
        validate={(values) => {
          const errors = {};
          return errors;
        }}
        onSubmit={() => {

        }}
      >
        {({ values, setFieldValue, errors, handleChange }) => (
          <Box>
            <Box>
              <InputField
                width="100%"
                label="Email"
                error={errors.email}
                value={values.email}
              >
                {({ label, value }) =>
                  <TextInput
                    placeholder={label}
                    // @ts-ignore
                    value={value}
                    onChange={handleChange('username')}
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
            <Button m={0}>SEND RESET EMAIL</Button>
          </Box>
        )}
        </Formik>
    </Box>
  );
};

export default ResetPasswordForm;
