import React from 'react';
import { TextInput } from '@elemental-zcash/components';

const FormTextInput = ({ label, value, onChange, ...props }: {
  label?: string, value: any, onChange: Function,
}) => (
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

export default FormTextInput;
