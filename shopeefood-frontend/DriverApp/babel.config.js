module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin', // Dòng lệnh bắt buộc để Menu trượt hoạt động
    ],
  };
};