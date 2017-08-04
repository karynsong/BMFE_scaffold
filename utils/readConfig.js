/**
 * @Author: songqi
 * @Date:   2016-07-15
 * @Email:  songqi@benmu-health.com
 * @Last modified by:   songqi
 * @Last modified time: 2017-02-15
 */

var fs = require('fs'),
    _ = require('lodash'),
    path = require('path');

var CONFIG;

function readAllConfig() {
    var stat,
        configPath = path.join(process.cwd(), 'config.js');
    try {
        stat = fs.statSync(configPath);
    } catch (e) {}
    if (stat) {
        CONFIG = require(configPath);
    }
}

function get(key) {
    if (CONFIG && CONFIG[key]) {
        return _.cloneDeep(CONFIG[key]);
    } else {
        return false;
    }
}

readAllConfig();

module.exports = {
    get: get
}