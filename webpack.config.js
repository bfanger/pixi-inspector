var webpack = require('webpack')

module.exports = {
    entry: {
        'pixi-panel': './src/bootstrap.js',
        common: './src/common.js'
    },
    devtool: process.env.NODE_ENV !== 'production' ? 'source-map' : '',
    output: {
        filename: '[name].js',
        path: __dirname + '/build'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel-loader',
            options: {
                presets: ['es2015', 'react']
            },
            include: __dirname + '/src'
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
        new webpack.optimize.CommonsChunkPlugin({ name: 'common' })
    ],
    devServer: {
        // publicPath: __dirname + '/',
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
