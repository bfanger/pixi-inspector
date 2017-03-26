var webpack = require('webpack')

if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = (process.argv.indexOf('-p') !== -1) ? 'production' : 'development'
}

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
    resolve: {
        extensions: ['.js', '.vue']
    },
    module: {
        loaders: [{
            test: /\.vue$/,
            loader: 'vue-loader',
            include: __dirname + '/src',
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
            test: /\.js$/,
            loader: 'babel-loader',
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
