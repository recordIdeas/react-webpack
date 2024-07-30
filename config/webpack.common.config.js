const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const setMPA = require('./webpack.config.js');
const { entry, htmlWebpackPlugins } = setMPA();

module.exports = {
  mode: 'development',
  entry: entry,
  output: {
    filename: 'web/js/[name].[chunkhash].js',
    path: path.resolve(__dirname, '../build'),
  },
  plugins: [ // 配置插件
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({ // 添加插件
      filename: 'css/[name].[chunkhash].css'
    }),
    ...htmlWebpackPlugins
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: [
              '@babel/plugin-transform-runtime',
              '@babel/plugin-proposal-class-properties',
            ],
          },
        },
      },
      {
        test: /\.less$/i,
        exclude: path.resolve(__dirname, '../node_modules'),
        use: [
          {
            loader: 'style-loader', // 从 JS 中创建样式节点
          },
          {
            loader: 'css-loader', // 转化 CSS 为 CommonJS
          },
          {
            loader: 'less-loader', // 编译 Less 为 CSS
          },
        ]
      },
    ],
  },
};