module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@components': './src/components',
          '@screens': './src/screens',
          '@services': './src/services',
          '@hooks': './src/hooks',
          '@utils': './src/utils',
          '@types': './src/types',
          '@shared': './src/shared',
          '@constants': './src/constants',
          '@contexts': './src/contexts',
          '@navigation': './src/navigation',
          '@assets': './src/assets',
        },
      },
    ],
    // Reanimated plugin must be listed last
    'react-native-reanimated/plugin',
  ],
};
