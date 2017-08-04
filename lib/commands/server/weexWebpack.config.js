/**
 * @Author: songqi
 * @Date:   2017-01-13
* @Last modified by:   songqi
* @Last modified time: 2017-03-23
 */

var path = require('path');
var webpack = require('webpack');

var getFiles = require('../../../utils/getFiles');

module.exports = {
    devtool: "eval",
    entry: getFiles.getEntry(),
    output: {
        path: path.join(process.cwd(), "dist"),
        publicPath: path.join(process.cwd(), "dist/js/"),
        filename: "[name].js",
        chunkFilename: "[chunkhash].js"
    },
    module: {
        loaders: [{
            test: /\.js$/,
            include: path.join(process.cwd(), "src/js/"),
            exclude: /node_modules|bower_components|base_libs|baseLibs/,
            loader: 'babel-loader',
            query: {
                plugins: [
                    path.resolve(__dirname, '../../../node_modules/babel-plugin-transform-runtime')
                ],
                presets: [
                    path.resolve(__dirname, '../../../node_modules/babel-preset-es2015'),
                    path.resolve(__dirname, '../../../node_modules/babel-preset-stage-0')
                ]
            }
        }, {
            test: /\.vue(\?[^?]+)?$/,
            exclude: /node_modules|bower_components|base_libs|baseLibs/,
            loaders: ['weex']
        }]
    },
    vue: {
        preserveWhitespace: false
    },
    plugins: [
        new webpack.BannerPlugin(
        '// { "framework": "Vue" }\n', {
            raw: true
        }
    )],
    resolveLoader: {
        root: [path.join(__dirname, '../../../', 'node_modules')]
    },
    resolve: {
        extensions: ['', '.js', '.vue', '.json', '.coffee'],
        alias: getFiles.getAlias()
    }
}
