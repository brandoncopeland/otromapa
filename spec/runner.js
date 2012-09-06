// spec test runner
// run... node runner.js

var requirejs = require('requirejs');
requirejs.config({
	nodeRequire: require
});

global.define = require('requirejs');

global.describe = require('../jasmine/jasmine-1.2.0/jasmine').describe;
global.it = require('../jasmine/jasmine-1.2.0/jasmine').it;
global.expect = require('../jasmine/jasmine-1.2.0/jasmine').expect;
global.beforeEach = require('../jasmine/jasmine-1.2.0/jasmine').beforeEach;

function magenta(s) { return ['\033[35m', s, '\033[0m'].join(''); }

// requirejs(['./sample/samplespec'], function (samplespec) {
// 	console.log(['\n', magenta(samplespec.name), '\n'].join(''));
// 	var jasmine = require('../jasmine/jasmine-1.2.0/jasmine').jasmine;
// 	var ConsoleReporter = require('../jasmine/jasmine-consolereporter').ConsoleReporter;
// 	jasmine.getEnv().addReporter(new ConsoleReporter());
// 	jasmine.getEnv().execute();
// });

requirejs(['./models/layermodelspec'], function (samplespec) {
	console.log(['\n', magenta(samplespec.name), '\n'].join(''));
	var jasmine = require('../jasmine/jasmine-1.2.0/jasmine').jasmine;
	var ConsoleReporter = require('../jasmine/jasmine-consolereporter').ConsoleReporter;
	jasmine.getEnv().addReporter(new ConsoleReporter());
	jasmine.getEnv().execute();
});