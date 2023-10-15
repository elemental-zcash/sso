import React from 'react';

import { AppWrapper } from '../pages/_app';


const appWrapper = (Story) => (// @ts-ignore
  <AppWrapper>
    <Story />
  </AppWrapper>
);

export default appWrapper;
