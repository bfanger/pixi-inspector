var gulp = require('gulp');
var gutil = require('gulp-util');
var webpack = require("webpack");
var WebpackDevServer = require("webpack-dev-server");
var webpackConfig = require("./webpack.config.js");

gulp.task("webpack", function(done) {
    // run webpack
    webpack(webpackConfig, function(err, stats) {
        if (err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString({
            // output options
        }));
        done();
    });
});

gulp.task("webpack-dev-server", function(done) {
    // Start a webpack-dev-server
    var compiler = webpack(webpackConfig);

    new WebpackDevServer(compiler, {
        contentBase: __dirname + '/public',
        progress: true, 
        colors: true,
        // server and middleware options
    }).listen(8090, "localhost", function(err) {
        if(err) throw new gutil.PluginError("webpack-dev-server", err);
        // Server listening
        gutil.log("[webpack-dev-server]", "http://localhost:8090/webpack-dev-server/index.html");

        // keep the server alive or continue?
        done();
    });
});

gulp.task('default', ['webpack-dev-server']);