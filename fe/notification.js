/*
* @Author: qinyang
* @Date:   2016-11-17 21:29:37
* @Last Modified by:   qinyang
* @Last Modified time: 2016-11-17 22:30:53
*/
var player = require('play-sound')();

class Notification2 extends window.Notification {
	constructor (title, opt) {
		opt.silent = true; // 保持安静
		super(title, opt);
		player.play('../res/test.mp3', function (err) {
			console.log('player err', err);
		});
	}
}

module.exports = Notification2;

