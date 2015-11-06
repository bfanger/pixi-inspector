module.exports = {
    entry: './src/bootstrap.js',
    devtool: process.env.NODE_ENV !== 'production' ? 'source-map' : '',
    output: {
    filename: 'pixi-panel.js',
        path: __dirname + '/build'
    },
    resolve: {
        extensions: ['', '.jsx', '.webpack.js', '.web.js', '.js']
    },
    module: {
        loaders: [
            {
                test: /\.js(x)?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                query: {
                    cacheDirectory: true,
                    presets:['es2015', 'react']
                }
            },
            {
                test: /\.scss$/,
                loader: 'style!css!sass'
            }
        ]
    },
    externals: {
        //don't bundle the 'react' npm package with our bundle.js
        //but get it from a global 'React' variable
        'react': 'React',
        'react-dom': 'ReactDOM',
        'rx': 'Rx'
    }
}
