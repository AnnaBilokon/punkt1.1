module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': '.',
            '@/app': './app',
            '@/features': './features',
            '@/entities': './entities',
            '@/shared': './shared',
            '@/components': './components',
            '@/hooks': './hooks',
            '@/services': './services',
            '@/store': './store',
            '@/constants': './constants',
            '@/types': './types',
            '@/theme': './theme',
            '@/assets': './assets',
            '@/mocks': './mocks',
            '@/design': './design',
          },
        },
      ],
      'nativewind/babel',
      'react-native-reanimated/plugin',
    ],
  };
};
