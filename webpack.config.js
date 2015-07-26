module.exports = {
    entry: './src/bootstrap.js',
    devtool: "source-map",
    output: {
    filename: 'pixi-panel.js',
        path: __dirname + '/build'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                query: {
                    cacheDirectory: true
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
        'react': 'React'
    }
}