/* config-overrides.js */
/* eslint-disable react-hooks/rules-of-hooks */
const { useBabelRc, override, addLessLoader } = require("customize-cra");
const CompressionPlugin = require("compression-webpack-plugin");

const compressJS = () => (config) => {
  if (!config.plugins) {
    config.plugins = [];
  }

  config.plugins.push(
    new CompressionPlugin({
      include: [/\.js(\?.*)?$/i, /\.css(\?.*)?$/i],
    }),
  );

  return config;
};

// 修改入口为 index.tsx
const entry = (config) => {
  config.entry = "./src/index.tsx";
  return config;
};

module.exports = override(
  addLessLoader({ javascriptEnabled: true }),
  useBabelRc(),
  compressJS(),
  entry(),
);
