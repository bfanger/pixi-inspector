module.exports = {
    entry: './src/bootstrap.js',
    devtool: "source-map",
    output: {
        filename: 'bundle.js',
        path: __dirname + '/public/build'
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
            }
        ]
    },
    externals: {
        //don't bundle the 'react' npm package with our bundle.js
        //but get it from a global 'React' variable
        'react': 'React'
    }
}