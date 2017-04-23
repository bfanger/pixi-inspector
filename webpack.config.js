var path = require('path')
var webpack = require('webpack')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
var HtmlPlugin = require('html-webpack-plugin')

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = (process.argv.indexOf('-p') !== -1) ? 'production' : 'development'
}

module.exports = {
  entry: {
    'pixi.panel': './src/pixi.panel.js',
    'pixi.devtools': './src/pixi.devtools.js',
    'pixi.background': './src/pixi.background.js'
  },
  devtool: process.env.NODE_ENV !== 'production' ? 'source-map' : '',
  output: {
    filename: '[name].bundle.js',
    path: path.join(__dirname, '/build')
  },
  resolve: {
    extensions: ['.js', '.vue']
  },
  module: {
    loaders: [{
      test: /\.js$/,
      include: path.join(__dirname, '/src'),
      enforce: 'pre',
      loader: 'eslint-loader',
      options: {
        failOnError: false,
        failOnWarning: false,
        emitError: false,
        emitWarning: true,
        formatter: require('eslint-friendly-formatter')
      }
    }, {
      test: /\.js$/,
      include: path.join(__dirname, '/src'),
      loader: 'babel-loader'
    }, {
      test: /\.vue$/,
      loader: 'vue-loader',
      include: path.join(__dirname, '/src'),
      options: {
        loaders: {
          scss: [
            'style-loader',
            'css-loader',
            'sass-loader'
          ]
        }
      }
    }, {
      test: /\.scss$/,
      loaders: [
        'style-loader',
        'css-loader',
        'sass-loader'
      ]
    }, {
      test: /\.png$/,
      loader: 'url-loader'
    }]
  },
  plugins: [
    new CopyWebpackPlugin([
      { context: 'src/chrome-extension', from: '**/*' }
    ]),
    // new webpack.NoEmitOnErrorsPlugin(),
    new HtmlPlugin(),
    new FriendlyErrorsPlugin()
  ],
  devServer: {
    // publicPath: path.join(__dirname, '/',)
    // progress: true,
    quiet: true
    // stats: {
    //   chunks: false,
    //   version: false,
    //   assets: false,
    //   hash: false,
    //   colors: true
    // }
  }
}
