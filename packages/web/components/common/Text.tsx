import { Text as _Text } from 'elemental-react';
import { ComponentProps, CSSProperties } from 'react';

const Text = ({ pointer, style, ...props }: ComponentProps<typeof _Text> & { pointer?: boolean, style?: CSSProperties }) => {
  return (
    <_Text 
      display="inline"
      style={pointer ? { ...style, cursor: 'pointer' } : style}
      {...props}
    />
  );
};

export const TextLink = ({ ...props }): ComponentProps<typeof Text> => {
  return (
    <Text
      pointer
      {...props}
    />
  );
};

export default Text;
