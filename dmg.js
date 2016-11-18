#!/usr/bin/env node
/*
* @Author: qin yang
* @Date:   2016-11-18 16:21:58
* @Last Modified by:   qin yang
* @Last Modified time: 2016-11-18 17:26:03
*/

var appdmg = require('appdmg');
var argv   = require('yargs').argv;
var package = require('./package.json');
var fs      = require('fs');
var env    = argv.env ? argv.env : 'release';
var target = `./dmg/日事清-${env}-osx-${package.version}.dmg`;
var appPath = `./package/${env}-x64/日事清-darwin-x64/日事清.app`;

try {
  var outDirState = fs.lstatSync('dmg');
} catch (e) {
  fs.mkdirSync('dmg');
}

try {
	var targetState = fs.lstatSync(target);
	fs.unlinkSync(target);
} catch (e) {}

var dmg = appdmg({ 
	basepath: __dirname, 
	target: target,
	specification: {
		"title": "日事清",
		"icon": "./res/app.icns",
		"background": "./res/dmg.jpg",
		"contents": [
			{ "x": 448, "y": 344, "type": "link", "path": "/Applications" },
			{ "x": 192, "y": 344, "type": "file", "path": appPath }
		]
	}
});