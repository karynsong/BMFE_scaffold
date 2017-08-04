/**
 * @Author: songqi
 * @Date:   2017-03-06
 * @Last modified by:   songqi
 * @Last modified time: 2017-04-06
 */

var _ = require('lodash'),
    path = require('path'),
    crypto = require('crypto'),
    through = require('through2'),
    __request = require('request'),
    jsonfile = require('jsonfile'),
    zipFolder = require('zip-folder'),
    Process = require('child_process'),
    print = require('../print'),
    argv = require('yargs').argv;

var readConfig = require('../readConfig');

var versionMap = [],
    pagesTag = '/pages/',
    iconfontTag = '/iconfont/',
    appName = readConfig.get('appName'),
    versionInfo = readConfig.get('version');

function getIconfontMd5() {
    return through.obj(function(file, enc, cb) {
        if (file.isStream()) {
            this.emit('error', new gutil.PluginError('gulp-debug', 'Streaming not supported'));
            return cb();
        }

        if (!file.contents) {
            return cb();
        }
        var filePath = file.history[0],
            indexTag = filePath.indexOf(iconfontTag),
            content = file.contents.toString('utf8');
        versionMap.push({
            android: versionInfo.android,
            iOS: versionInfo.iOS,
            page: filePath.slice(indexTag),
            md5: crypto.createHash('md5').update(content, 'utf8').digest('hex')
        });
        cb(null, file);
    }, function(cb) {
        cb();
    });
}

function addFramework(framework) {
    return through.obj(function(file, enc, cb) {
        if (file.isStream()) {
            this.emit('error', new gutil.PluginError('gulp-debug', 'Streaming not supported'));
            return cb();
        }

        if (!file.contents) {
            return cb();
        }
        var filePath = file.history[0],
            indexTag = filePath.indexOf(pagesTag),
            content = file.contents.toString('utf8'),
            text = (framework || '') + content;
        file.contents = new Buffer(text);
        versionMap.push({
            android: versionInfo.android,
            iOS: versionInfo.iOS,
            page: filePath.slice(indexTag),
            md5: crypto.createHash('md5').update(text, 'utf8').digest('hex')
        });
        cb(null, file);
    }, function(cb) {
        cb();
    });
}

function getMd5Version() {
    var md5Arr = [];
    versionMap.map(function(item) {
        md5Arr.push(item.md5);
    });
    md5Arr.sort();
    return crypto.createHash('md5').update(md5Arr.join(''), 'utf8').digest('hex')
}

function makeDiffZip(jsVersion) {
    var zipFolder = readConfig.get('zipFolder');
    if (zipFolder && (argv.d || argv.diff)) {
        var n = Process.fork(path.resolve(__dirname, './diffFile.js'));
        n.on('message', function(message) {
            if (message.type === 'done') {
                n.kill();
                Process.exec('cp dist/js/' + jsVersion + '.zip' + ' ' + path.resolve(zipFolder, appName), function(error, stdout, stderr) {
                    if (error !== null) {
                        print.info('exec error: ' + error);
                        return;
                    }
                    print.info('发布成功');
                })
            }
        })
        n.send({
            jsVersion: jsVersion
        });
    }
}

function writeJson(jsVersion) {
    var requestUrl = argv.s || argv.send,
        file = path.resolve(process.cwd(), 'dist/version.json');

    Process.exec('cd dist/js && ls | grep -v .zip | xargs rm -rf', function(error, stdout, stderr) {
        if (error !== null) {
            print.info('exec error: ' + error);
            return;
        }
        if (requestUrl) {
            __request.post(requestUrl, {
                form: versionInfo
            }, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    makeDiffZip(jsVersion);
                } else {
                    print.info('发布失败:' + error);
                }
            });
        } else {
            jsonfile.writeFile(file, versionInfo, function(err) {
                if (err) {
                    print.info('min-weex-json-error', err);
                } else {
                    makeDiffZip(jsVersion);
                }
            });
        }
    });
}

function minWeex() {
    var timestamp = +new Date(),
        jsVersion = getMd5Version(),
        md5File = path.resolve(process.cwd(), 'dist/js/_pages/md5.json');

    versionInfo['appName'] = appName;
    versionInfo['jsVersion'] = jsVersion;
    versionInfo['timestamp'] = timestamp;
    versionInfo['jsPath'] = readConfig.get('jsPath');

    jsonfile.writeFileSync(md5File, _.assign({
        filesMd5: versionMap
    }, versionInfo));
    zipFolder(path.resolve(process.cwd(), 'dist/js/_pages'), path.resolve(process.cwd(), 'dist/js/' + jsVersion + '.zip'), function(err) {
        if (err) {
            console.log('min-weex-zip-error', err);
        } else {
            writeJson(jsVersion);
        }
    });
}

module.exports = {
    minWeex: minWeex,
    addFramework: addFramework,
    getIconfontMd5: getIconfontMd5
}