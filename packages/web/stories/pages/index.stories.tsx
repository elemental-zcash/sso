import Home from '../../pages/index';
import { AppWrapper } from '../../pages/_app';
import appWrapper from '../decorators';

export default {
  title: "Pages/Home",
  component: Home,
  decorators: [
    appWrapper
  ]
};

export const HomePage = () => <Home />
