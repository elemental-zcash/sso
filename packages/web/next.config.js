const path = require('path');
const withTM = require('next-transpile-modules')(['@elemental-zcash/components', 'elemental-react']);

module.exports = withTM({
  // pageExtensions: getBareExtensions(['web']),
  // pageExtensions: ['web', 'web.js', 'mdx', 'md', 'jsx', 'js', 'tsx', 'ts'],
  webpack: (config) => ({
    ...config,
    module: {
      ...config.module,
      rules: [
        ...config.module.rules
      ]
    },
    resolve: {
      ...config.resolve,
      alias: {
        ...(config.resolve.alias || {}),
        'react-native$': 'react-native-web',
        '@elemental-zcash/icons': path.resolve(__dirname, './node_modules/@elemental-zcash/icons/'),
        'react-primitives': path.resolve(__dirname, './node_modules/react-primitives/'),
        'elemental-react': path.resolve(__dirname, './node_modules/elemental-react/'),
        '@react-platform/svg': path.resolve(__dirname, './node_modules/@react-platform/svg/'),
        '@react-platform/core': path.resolve(__dirname, './node_modules/@react-platform/core/'),
        '@react-platform/native': path.resolve(__dirname, './node_modules/@react-platform/native/'),
      },
      extensions: [
        '.web.js',
        '.web.ts',
        '.web.tsx',
        ...config.resolve.extensions,
      ],
    }
    // config.resolve.alias = {
    //   ...(config.resolve.alias || {}),
    //   // Transform all direct `react-native` imports to `react-native-web`
      
    // }
    // // config.resolve.extensions = [
    // //   '.web.js',
    // //   '.web.ts',
    // //   '.web.tsx',
    // //   ...config.resolve.extensions,
    // // ]
    // config.resolve.extensions = ['.web.js'].concat(config.resolve.extensions);
    // return config
  }),
});
