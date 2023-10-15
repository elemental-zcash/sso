import Home from "../../pages/index";
import { AppWrapper } from '../../pages/_app';

export default {
  title: "Pages/Home",
  component: Home,
  decorators: [
    (Story) => ( // @ts-ignore
      <AppWrapper>
        <Story />
      </AppWrapper>
    )
  ]
};

export const HomePage = () => <Home />
