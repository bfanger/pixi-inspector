var path = require('path')
var CopyWebpackPlugin = require('copy-webpack-plugin')

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
      use: [
        'babel-loader'
        // 'eslint-loader'
      ]
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
    ])
  ],
  devServer: {
    // publicPath: path.join(__dirname, '/',)
    // progress: true,
    stats: {
      chunks: false,
      version: false,
      assets: false,
      hash: false,
      colors: true
    }
  }
}
