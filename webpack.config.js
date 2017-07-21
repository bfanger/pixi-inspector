const webpack = require('webpack')
const merge = require('webpack-merge')
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = (process.argv.indexOf('-p') !== -1) ? 'production' : 'development'
}

const baseConfig = {
  entry: {
    'pixi.panel': './src/pixi.panel.js',
    'pixi.devtools': './src/pixi.devtools.js',
    'pixi.background': './src/pixi.background.js',
    'pixi.inspector': './src/pixi.inspector.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.join(__dirname, '/build'),
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js', '.vue'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
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
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    new CopyWebpackPlugin([
      { context: 'src/chrome-extension', from: '**/*' }
    ])
  ]

}
let devConfig = baseConfig
if (process.env.NODE_ENV === 'development') {
  devConfig = merge(baseConfig, {
    devtool: 'source-map',
    plugins: [
      new FriendlyErrorsPlugin()
    ]
  })
}
const isDevServer = process.argv.find(arg => {
  return arg.substr(-18) === 'webpack-dev-server'
})
let webpackConfig = devConfig
if (isDevServer) {
  webpackConfig = merge(devConfig, {
    entry: {
      'example': './tests/example.js'
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.DEV_SERVER': 'true'
      })
    ],
    devServer: {
      quiet: true
    }
  })
}
module.exports = webpackConfig
