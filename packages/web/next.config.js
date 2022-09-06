const withTM = require('next-transpile-modules')(['@elemental-zcash/components']);

module.exports = withTM({
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Transform all direct `react-native` imports to `react-native-web`
      'react-native$': 'react-native-web',
    }
    // config.resolve.extensions = [
    //   '.web.js',
    //   '.web.ts',
    //   '.web.tsx',
    //   ...config.resolve.extensions,
    // ]
    config.resolve.extensions = ['.web.js'].concat(config.resolve.extensions);
    return config
  },
});
