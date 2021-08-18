/* eslint-env node */
/* eslint-disable import/no-commonjs,import/no-nodejs-modules */
const webpack = require("webpack");
const { merge } = require("webpack-merge");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const Webpackbar = require("webpackbar");
const FriendlyErrorsWebpackPlugin = require("@nuxt/friendly-errors-webpack-plugin");
const { VueLoaderPlugin } = require("vue-loader");

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV =
    process.argv.indexOf("-p") !== -1 ? "production" : "development";
}
const mode = process.env.NODE_ENV;

const baseConfig = {
  mode,
  entry: {
    "pixi.panel": "./src/pixi.panel.js",
    "pixi.devtools": "./src/pixi.devtools.js",
    "pixi.background": "./src/pixi.background.js",
    "pixi.inspector": "./src/pixi.inspector.js",
  },
  output: {
    filename: "[name].bundle.js",
    path: path.join(__dirname, "/build"),
    publicPath: "/",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.join(__dirname, "/src"),
        loader: "babel-loader",
      },
      {
        test: /\.vue$/,
        loader: "vue-loader",
        include: path.join(__dirname, "/src"),
        options: {
          loaders: {
            scss: ["style-loader", "css-loader", "sass-loader"],
          },
        },
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.png$/,
        loader: "url-loader",
      },
    ],
  },
  plugins: [
    new FriendlyErrorsWebpackPlugin(),
    new Webpackbar(),
    new webpack.DefinePlugin({
      "process.env": {
        DEBUG_DEVTOOLS_RX: JSON.stringify(process.env.DEBUG_DEVTOOLS_RX),
      },
    }),
    new VueLoaderPlugin(),
    new CopyWebpackPlugin({
      patterns: [{ context: "src/chrome-extension", from: "**/*" }],
    }),
  ],
};
let devConfig = baseConfig;
if (process.env.NODE_ENV === "development") {
  devConfig = merge(baseConfig, {
    devtool: "source-map",
  });
}
const isDevServer = /webpack serve/.test(process.argv.join(" "));
let webpackConfig = devConfig;
if (isDevServer) {
  webpackConfig = merge(devConfig, {
    entry: {
      example: "./tests/example.js",
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.env.DEV_SERVER": "true",
      }),
    ],
    devServer: {
      port: process.env.PORT || 8080,
      contentBase: path.join(__dirname, "tests"),
      quiet: true,
    },
  });
}
module.exports = webpackConfig;
