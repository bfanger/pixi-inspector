var gulp = require('gulp');
var gutil = require('gulp-util');
var webpack = require("webpack");
var WebpackDevServer = require("webpack-dev-server");
var webpackConfig = require("./webpack.config.js");
var fs = require("fs");
var buildSuffix = false;

gulp.task("build", function(done) {
    // Copy 
    gulp.src([
        'src/chrome-extension/*',
        'src/pixi.inspector.js',
        'node_modules/react/dist/react-with-addons.min.js',
        'node_modules/react-dom/dist/react-dom.min.js',
        'node_modules/rx/dist/rx.all.min.js'
    ]).pipe(gulp.dest('build/')).on('end', function () {
        if (buildSuffix) {
            buildSuffix++;
            var manifest = JSON.parse(fs.readFileSync('src/chrome-extension/manifest.json'));
            manifest.version += '.' + buildSuffix;
            fs.writeFileSync('build/manifest.json', JSON.stringify(manifest, null, 4));
        }
    });
    gulp.src('img/**/*').pipe(gulp.dest('build/img/'));
    // Create bundle
    return webpack(webpackConfig, function(err, stats) {
        if (err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString());
        done();
    });
});

gulp.task("continuous-build", ['build'], function() {
    buildSuffix = 1;
    return gulp.watch(['src/**/*'], ['build']);
});

gulp.task("webpack-dev-server", function(done) {
    new WebpackDevServer(webpack(webpackConfig), {
        contentBase: __dirname + '/',
        progress: true, 
        stats: { colors: true }
    }).listen(8090, "localhost", function(err) {
        if (err) {
            throw new gutil.PluginError("webpack-dev-server", err);
        }
        gutil.log("[webpack-dev-server]", "http://localhost:8090/webpack-dev-server/");
        done();
    });
});

gulp.task('default', ['webpack-dev-server']);