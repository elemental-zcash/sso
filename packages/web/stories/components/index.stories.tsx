import { useState } from 'react';
import Home from '../../pages/index';
import { AppWrapper } from '../../pages/_app';
import appWrapper from '../decorators';

import { FormTextInput } from '#components/lib';

export default {
  title: "Components",
  // component: FormTextInput,
  decorators: [
    appWrapper
  ]
};

// @ts-ignore
export const FormTextInputComponent = () => {
  const [val, setVal ] = useState();

  return <FormTextInput value={val} onChange={(event) => setVal(event?.target?.value)}/>;
}
