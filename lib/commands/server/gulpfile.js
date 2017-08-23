/**
 * @Author: songqi
 * @Date:   2016-07-15
 * @Email:  songqi@benmu-health.com
 * @Last modified by:   songqi
 * @Last modified time: 2017-05-25
 */

var os = require('os'),
    _ = require('lodash'),
    path = require('path'),
    gulp = require('gulp'),
    sass = require('gulp-sass'),
    less = require('gulp-less'),
    notify = require('gulp-notify'),
    plumber = require('gulp-plumber'),
    webpack = require('webpack'),
    gutil = require('gulp-util'),
    argv = require('yargs').argv,
    clean = require('gulp-clean'),
    logColors = require('colors'),
    merge = require('merge-stream'),
    gulpOpen = require('gulp-open'),
    uglifyJs = require('gulp-uglify'),
    gulpSequence = require('gulp-sequence'),
    mockServer = require('gulp-mock-server'),
    fileinclude = require('gulp-file-include'),
    templateCache = require('gulp-angular-templatecache'),
    webpackConfig = Object.create(require('./webpack.config.js')),
    weexWebpackConfig = Object.create(require('./weexWebpack.config.js'));

var print = require('../../../utils/print'),
    weexUtil = require('../../../utils/weex/weex'),
    getFiles = require('../../../utils/getFiles'),
    duration = require('../../../utils/duration'),
    readConfig = require('../../../utils/readConfig'),
    md5Task = require('../../../utils/md5Files/md5Task'),
    htmlMonitor = require('../../../utils/monitor/htmlMonitor');

var mockConfig = {
    port: 52077,
    mockDir: './dist/mock'
}

if (argv.s || argv.ssl) {
    mockConfig['https'] = true;
}

var MOCKHOST = _.assign(mockConfig, readConfig.get('mockServer'));

var MD5LENGTH = readConfig.get('md5Len') || 10;

var OPENPATH = readConfig.get('openPath') || 'http://fe.benmu-health.com';

var browser = os.platform() === 'linux' ? 'Google chrome' : (
    os.platform() === 'darwin' ? 'Google chrome' : (
        os.platform() === 'win32' ? 'chrome' : 'firefox'));

logColors.setTheme({
    info: 'green',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});

//用于在html文件中直接include文件 模板拼接
gulp.task('build-html', function(done) {
    gulp.src(['html/page/**/*.html'])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(htmlMonitor())
        .pipe(duration('build-html'))
        .pipe(gulp.dest('dist/html'))
        .on('end', done);
});

// angularjs 模板片段
gulp.task('build-templates', function(done) {
    gulp.src('src/templates/**/*.html')
        .pipe(templateCache({
            module: readConfig.get('templatesName')
        }))
        .pipe(duration('build-templates'))
        .pipe(gulp.dest('dist/js'))
        .on('end', done);
});

// iconfont
gulp.task('build-iconfont', function(done) {
    gulp.src('src/iconfont/**/*')
        .pipe(duration('build-iconfont'))
        .pipe(gulp.dest('dist/iconfont'))
        .on('end', done);
});

// 编译 sass
gulp.task('build-css', function(done) {
    var tasks = getFiles.getExports('css').map(function(element) {
        if (element.indexOf('.scss') > -1) {
            // sass
            return gulp.src(element)
                .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
                .pipe(gulp.dest(element.replace(/src/, 'dist').match(/(\/.+\/)/)[0]))
        } else if (element.indexOf('.less') > -1) {
            // sass
            return gulp.src(element)
                .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
                .pipe(less())
                .pipe(gulp.dest(element.replace(/src/, 'dist').match(/(\/.+\/)/)[0]))
        } else {
            return gulp.src(element)
                .pipe(gulp.dest(element.replace(/src/, 'dist').match(/(\/.+\/)/)[0]))
        }
    });
    if (tasks.length) {
        return merge(tasks).pipe(duration('build-css'));
    } else {
        done();
    }
});


var _webpackConfig = webpackConfig;
if (readConfig.get('weex')) {
    _webpackConfig = weexWebpackConfig;
}
var _webpack = webpack(_webpackConfig);

// 引用 webpack 对 js 进行合并
gulp.task("build-js", function(callback) {
    var times = +new Date();
    _webpack.run(function(err, stats) {
        var jsonStats = stats.toJson();
        if (stats.hasErrors()) {
            gutil.log("[webpack:build-js]", logColors.error(jsonStats.errors.toString()));
        }
        if (stats.hasWarnings()) {
            gutil.log("[webpack:build-js]", logColors.warn(jsonStats.warnings.toString()));
        }
        print.gulpLog(' build-js: ', +new Date() - times)
        callback();
    });
});

gulp.task('build-js-for-min', function(callback) {
    var timestamp = +new Date();
    _webpackConfig.devtool = 'source-map';
    if (readConfig.get('vue2')) {
        _webpackConfig.plugins = _webpackConfig.plugins.concat([new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: '"production"'
                }
            }),
            new webpack.optimize.UglifyJsPlugin({
                sourceMap: true,
                compress: {
                    warnings: false
                }
            })
        ])
    }

    webpack(_webpackConfig).run(function(err, stats) {
        var jsonStats = stats.toJson();
        if (stats.hasErrors()) {
            gutil.log("[webpack:build-js]", logColors.error(jsonStats.errors.toString()));
        }
        if (stats.hasWarnings()) {
            gutil.log("[webpack:build-js]", logColors.warn(jsonStats.warnings.toString()));
        }
        print.gulpLog(' build-js-for-min: ', +new Date() - timestamp);
        callback();
    });
});


// 编译 mock 数据
gulp.task('build-mock', function() {
    gulp.src('src/mock/**/*')
        .pipe(duration('build-mock'))
        .pipe(gulp.dest('dist/mock'));
});

// mock 数据 server
gulp.task('mock', function() {
    gulp.src('.')
        .pipe(duration('mockServer'))
        .pipe(mockServer(MOCKHOST));
});

//将js加上10位md5,并修改html中的引用路径，该动作依赖build-js
gulp.task('md5:js', ['build-js-for-min'], function(done) {
    var tasks = getFiles.getAllFiles(path.resolve(process.cwd(), 'dist/js'), 'js');
    md5Task(tasks, 'js', done);
});

//将css加上10位md5，并修改html中的引用路径，该动作依赖sprite
gulp.task('md5:css', ['build-css'], function(done) {
    var tasks = getFiles.getAllFiles(path.resolve(process.cwd(), 'dist/css'), 'css');
    md5Task(tasks, 'css', done);
});

// 切换至weex-eros逻辑
var isWeexEros = false
gulp.task('weex:eros', function(done) {
    isWeexEros = true
    done()
});

//将js加上10位md5,并修改html中的引用路径，该动作依赖build-js
gulp.task('weex:js', ['build-js-for-min'], function(done) {
    var tasks = [];
    getFiles.getAllFiles(path.resolve(process.cwd(), 'dist/js'), 'js').map(function(element) {
        if (element.indexOf('pages') !== -1) {
            var lastIndex = element.lastIndexOf('/');
            distDir = element.slice(0, lastIndex);
            tasks.push(gulp.src(element)
                .pipe(uglifyJs())
                .pipe(weexUtil.addFramework(readConfig.get('framework')))
                .pipe(gulp.dest(distDir.replace(/pages/, '_pages'))))
        }
    })
    if (tasks.length) {
        return merge(tasks).pipe(duration('build-weex-js')).on('end', function() {
            gulp.src('src/iconfont/**/*')
                .pipe(weexUtil.getIconfontMd5())
                .pipe(duration('build-iconfont'))
                .pipe(gulp.dest('dist/js/_pages'))
                .on('end', function() {
                    weexUtil.minWeex(isWeexEros);
                });
        });
    } else {
        done();
    }
});

// 文件监听
gulp.task('watch', function() {
    console.log('watch')
    gulp.watch('src/css/**/*', ['build-css']);
    gulp.watch('src/js/**/*', ['build-js']);
    gulp.watch('html/**/*', ['build-html']);
    gulp.watch('src/templates/**/*', ['build-templates']);
    gulp.watch('src/mock/**/*', ['build-mock']);
    gulp.watch('./config.json', ['build-css', 'build-js']);
});

// 直接打开页面
gulp.task('open', function(done) {
    gulp.src('')
        .pipe(gulpOpen({
            app: browser,
            uri: OPENPATH
        }))
        .on('end', done);
});

// 删除 dist 文件夹
gulp.task('clean', function(done) {
    return gulp.src('dist', {
            read: false
        })
        .pipe(clean({
            force: true
        }));
});

// 删除所有依赖
gulp.task('cleanAll', function(done) {
    return gulp.src(['dist', 'bower_components', 'node_modules'], {
            read: false
        })
        .pipe(clean({
            force: true
        }));
});

// 发布
gulp.task('default', gulpSequence(
    'clean', ['build-html', 'build-templates', 'build-iconfont'], ['md5:css', 'md5:js']
));

// 发布 weex
gulp.task('weex', gulpSequence(
    'clean', 'weex:js'
));
// 发布 weex
gulp.task('weex-eros', gulpSequence(
    'clean', 'weex:eros', 'weex:js'
));

// 开发
gulp.task('dev', gulpSequence(
    'clean', ['build-html', 'build-templates', 'build-iconfont', 'build-mock'], ['build-css', 'build-js'], ['mock', 'watch', 'open']
));

module.exports = {
    start: function(type) {
        gulp.start(type)
    }
}