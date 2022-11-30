import React, { useState } from 'react';
import { Box, Row, Text } from 'elemental-react';
import { InputField, TextInput } from '@elemental-zcash/components';

const PasswordField = ({ error, label = 'Password', value, onChange }) => {
  const [isHidden, setIsHidden] = useState(true);

  return (
    <InputField
      width="100%"
      label={label}
      error={error}
      value={value}
    >
      {({ label, value }) => (
        <Row alignItems="center" position="relative">
          <TextInput
            placeholder={label} // @ts-ignore
            value={value}
            onChange={onChange}
            type={isHidden ? 'password' : 'text'}
            borderWidth={1}
            borderRadius={4}
            height={40}
            borderColor="#e2e2f2"
            px={3}
            pr={40}
            pb={0}
            flex={1}
          />
          <Box
            position="absolute"
            top={0}
            right={0}
            borderRadius={2}
            ml={3}
            width={40}
            height={40}
            // bg="#f1f1f1"
            alignItems="center"
            justifyContent="center"
            onClick={() => setIsHidden(!isHidden)}
          >
            <Text style={{ pointerEvents: 'none' }}>{isHidden ? '🙈' : '👀'}</Text>
          </Box>
        </Row>
      )}
    </InputField>
  )
};

export default PasswordField;
