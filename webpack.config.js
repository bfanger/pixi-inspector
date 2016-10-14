module.exports = {
    entry: './src/bootstrap.js',
    devtool: process.env.NODE_ENV !== 'production' ? 'source-map' : '',
    output: {
    filename: 'pixi-panel.js',
        path: __dirname + '/build'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    cacheDirectory: true,
                    presets:['es2015', 'react']
                },
                include: __dirname +'/src'
            },
            {
                test: /\.scss$/,
                loader: 'style!css!sass'
            },
            {
                test: /\.png$/,
                loader: 'url'
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
