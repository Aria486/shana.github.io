/* config-overrides.js */
/* eslint-disable react-hooks/rules-of-hooks */
const { useBabelRc, override, addLessLoader } = require("customize-cra");
const CompressionPlugin = require("compression-webpack-plugin");

const compressJS = () => (config) => {
  if (!config.plugins) {
    config.plugins = [];
  }
  // config = injectBabelPlugin(
  //   ['import', { libraryName: 'antd', libraryDirectory: 'es', style: 'css' }],
  //   config,
  // );
  // config.plugins.push(
  //   new CSSSplitWebpackPlugin({ filename: 'static/css/[name]-[part].[ext]', size: 4000 }),
  // );

  config.plugins.push(
    new CompressionPlugin({
      include: [/\.js(\?.*)?$/i, /\.css(\?.*)?$/i],
    }),
  );

  // config.plugins.push(
  //   new CompressionPlugin({
  //     algorithm: "gzip",
  //   })
  // );

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
