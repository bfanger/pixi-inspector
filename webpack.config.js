/* eslint-env node */
const webpack = require("webpack");
const { merge } = require("webpack-merge");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const Webpackbar = require("webpackbar");
const FriendlyErrorsWebpackPlugin = require("@nuxt/friendly-errors-webpack-plugin");
const { VueLoaderPlugin } = require("vue-loader");

const pos = process.argv.indexOf("--mode");
const mode = pos === -1 ? "production" : process.argv[pos + 1];
const isDevServer = /webpack serve/.test(process.argv.join(" "));

const baseConfig = {
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
      "process.env.DEBUG_DEVTOOLS_RX": JSON.stringify(
        process.env.DEBUG_DEVTOOLS_RX
      ),
      "process.env.DEV_SERVER": JSON.stringify(isDevServer),
    }),
    new VueLoaderPlugin(),
    new CopyWebpackPlugin({
      patterns: [{ context: "src/chrome-extension", from: "**/*" }],
    }),
  ],
};
let devConfig = baseConfig;

if (mode === "development") {
  devConfig = merge(baseConfig, {
    devtool: "source-map",
  });
}

let webpackConfig = devConfig;
if (isDevServer) {
  webpackConfig = merge(devConfig, {
    entry: {
      example: "./tests/example.js",
    },
    devServer: {
      port: process.env.PORT || 8080,
      static: path.join(__dirname, "tests"),
    },
  });
}
module.exports = webpackConfig;
