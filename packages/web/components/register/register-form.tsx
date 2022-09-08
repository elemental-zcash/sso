import { InputField, AutoTextArea, TextInput, Button } from '@elemental-zcash/components';
import { Box, Text } from 'elemental-react';
import { Formik } from 'formik';
import React from 'react';
import PasswordField from './PasswordField';

const RegisterForm = () => {

  return (
    <Box borderWidth={1} borderColor="#e2e2f2" borderRadius={4} p={40} flex={1}>
      <Text center bold fontSize={24} mb={3}>Register</Text>
      <Formik
        initialValues={{ username: '', password: '' }}
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
                label="Username"
                error={errors.username}
                value={values.username}
              >
                {({ label, value }) =>
                  <TextInput
                    placeholder={label}
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
            <Box>
              <PasswordField
                error={errors.password}
                value={values.password}
                label="Password"
                onChange={handleChange('password')}
              />
              {/* <InputField
                width="100%"
                label="Password"
                error={errors.password}
                value={values.password}
              >
                {({ label, value }) =>
                  <TextInput
                    placeholder={label}
                    value={value}
                    onChange={handleChange('password')}
                    // onChangeText={(text) => {
                    //   setFieldValue('password', text);
                    // }}
                    borderBottomWidth={0}
                    pb={0}
                  />
                }
              </InputField> */}
            </Box>
            <Button m={0}>SIGN UP</Button>
          </Box>
        )}
        </Formik>
    </Box>
  );
};

export default RegisterForm;
