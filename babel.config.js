module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Láttu Expo/RN “worklets” (t.d. Reanimated) virka rétt.
      'react-native-reanimated/plugin',
    ],
  };
};
