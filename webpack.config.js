/* eslint-disable @typescript-eslint/no-var-requires */
const app = process.env.npm_config_app || process.env.APP || 'app';

const webpack = require('webpack');
const path = require('path');

const root = path.resolve(__dirname);

// third party plugins
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const BuildIndexHTML = require('./plugins/buildIndexHTML');

// Package JSON
const packageJson = require('./package.json');

const definePlugin = new webpack.DefinePlugin({
  'process.env': {
    // this is needed for react to give us it's production build
    NODE_ENV: JSON.stringify('production'),
    APP_VERSION: JSON.stringify(packageJson.version),
  },
});

const caseSensitivePathsPlugin = new CaseSensitivePathsPlugin();
const copyPlugin = new CopyWebpackPlugin({
  patterns: [
    { from: './src/index.hbs', to: './' },
    { from: `./src/apps/${app}/config.json`, to: './' },
  ],
});

const cssExtractPlugin = new MiniCssExtractPlugin({ filename: 'index.css' });
const outputDirectory = process.env.OUTPUT_BUILD_DIRECTORY || 'localDev';
const maxChunksPlugin = new webpack.optimize.LimitChunkCountPlugin({
  maxChunks: 1,
});

module.exports = {
  entry: {
    index: path.resolve(root, `src/apps/${app}`),
  },
  output: {
    path: path.resolve(root, `build/${app}/${outputDirectory}`),
    filename: '[name].js',
  },
  name: app,
  mode: (process.env.CERT && 'development') || 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
        },
        exclude: /node_modules/,
      },
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            cacheDirectory: true,
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: [
              '@babel/plugin-transform-nullish-coalescing-operator',
              '@babel/plugin-transform-modules-commonjs',
              '@babel/plugin-transform-optional-chaining',
              '@babel/plugin-transform-class-properties',
            ],
          },
        },
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              esModule: false,
            },
          },
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              prependData: '@import "variables";',
              sassOptions: {
                includePaths: [path.resolve(root, `src/apps/${app}`)],
                // Suppress "Using / for division outside of calc() is deprecated and will
                // be removed in Dart Sass 2.0.0." warning
                quietDeps: true,
              },
            },
          },
        ],
        include: path.resolve(root, 'src'),
      },
      {
        test: /\.(jpe?g|gif|png|svg|woff|woff2|eot|ttf|wav|mp3|html)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: `[path][name].[ext]${process.env.OUTPUT_BUILD_DIRECTORY
              ? `?dev=buildKey_${process.env.OUTPUT_BUILD_DIRECTORY}`
              : ''
              }`,
            publicPath: '/',
          },
        },
      },
    ],
  },
  node: {
    fs: 'empty',
  },
  resolve: {
    modules: [
      `${path.resolve(root, 'src')}`,
      `${path.resolve(root, `src/apps/${app}`)}`,
      'node_modules',
    ],
    extensions: ['.js', '.mjs', '.tsx', '.ts'],
  },
  devtool: 'eval-cheap-module-source-map',
  // optimization: { splitChunks: {
  // cacheGroups: { commons: { filename: 'vendor.js', test: /[\\/]node_modules[\\/]/, chunks: 'initial' } }
  // } },
  plugins: [
    new BuildIndexHTML(),
    maxChunksPlugin,
    cssExtractPlugin,
    caseSensitivePathsPlugin,
    copyPlugin,
    definePlugin,
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  ],
  stats: { children: false },
};
