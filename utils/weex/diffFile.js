/**
* @Author: songqi
* @Date:   2017-03-09
* @Last modified by:   songqi
* @Last modified time: 2017-03-09
*/
var fs = require('fs'),
    path = require('path'),
    crypto = require('crypto'),
    print = require('../print'),
    Process = require('child_process'),
    readConfig = require('../readConfig');

var appName = readConfig.get('appName'),
    zipFolder = readConfig.get('zipFolder');

function makeDiff(jsVersion, newZipFolder){
    var files = fs.readdirSync(newZipFolder),
        newZip = path.resolve(process.cwd(), 'dist/js/' + jsVersion + '.zip'),
        promiseAll = files.map(function(item) {
            if(item.indexOf('.zip') !== -1 && item !== jsVersion + '.zip'){
                var md5 = item.slice(0, -4),
                    oldZip = path.resolve(newZipFolder, md5 + '.zip'),
                    diffZipMd5 = crypto.createHash('md5').update(md5 + jsVersion, 'utf8').digest('hex'),
                    diffZip = path.resolve(process.cwd(), 'dist/js/' + diffZipMd5 + '.zip');
                return new Promise(function(resolve, reject){
                    Process.exec('bsdiff ' + oldZip + ' ' + newZip + ' ' + diffZip, function(error, stdout, stderr) {
                        if (error !== null) {
                            print.info('exec error: ' + error);
                            return;
                        }
                        resolve();
                    })
                });
            }
        });
    Promise.all(promiseAll).then(function(){
        process.send({
            type: 'done'
        });
    })
}

process.on('message', function(message) {
    var jsVersion = message.jsVersion,
        filePath = path.resolve(zipFolder, appName)
    fs.stat(filePath, function(err, data) {
        if (err){
            fs.mkdirSync(filePath);
            makeDiff(jsVersion, filePath)
        }else{
            makeDiff(jsVersion, filePath);
        }
    });
});
