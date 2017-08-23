/**
* @Author: songqi
* @Date:   2017-01-10
* @Last modified by:   songqi
* @Last modified time: 2017-03-23
*/

var print = require('../../utils/print'),
    argv = require('yargs').argv,
    path = require('path'),
    gulpServer = require('./server/gulpfile'),

    Process = require('child_process');

var config = {
    name: 'eros',
    explain: '压缩打包上线 weex 项目',
    command: 'BM eros',
    options: [{
        keys: ['min'],
        describe: '压缩weex zip包'
    },{
        keys: ['init'],
        describe: '压缩weex zip包'
    }]
}

function helpTitle(){
    print.title(config);
}

function helpCommand(){
    print.command(config);
}

function iosDepInstall() {
    console.log('bm-eros | 开始更新和加载 ios 依赖')
	var build = Process.exec('./install.sh', {cwd: path.resolve(process.cwd(), '../ios/WeexEros/')}, function(error, stdout, stderr) {
        if (error !== null) {
            print.info('exec error: ' + error);
            return;
        }
        console.log('bm-eros | ios 依赖加载完成')
    }); 
    build.stdout.on('data', function(data){
    	console.log(data)
	});
}
function androidDepInstall() {
    console.log('bm-eros | 开始更新和加载 android 依赖')
	var build = Process.exec('./install.sh', {cwd: path.resolve(process.cwd(), '../android/WeexFrameworkWrapper/')}, function(error, stdout, stderr) {
        if (error !== null) {
            print.info('exec error: ' + error);
            return;
        }
        console.log('bm-eros | android 依赖加载完成')
    });
	build.stdout.on('data', function(data){
    	console.log(data)
	});     
}

function run(){
    (argv.h || argv.help) && helpCommand();
    (argv._[1] === 'min') && gulpServer.start('weex-eros');
    (argv._[1] === 'init' && argv._[2] === 'ios') && iosDepInstall();
    (argv._[1] === 'init' && argv._[2] === 'android') && androidDepInstall();
}

module.exports = {
    run: run,
    config: config,
    helpTitle: helpTitle,
    helpCommand: helpCommand
}
