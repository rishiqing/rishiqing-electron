/*
* @Author: qinyang
* @Date:   2016-11-17 21:29:37
* @Last Modified by:   qinyang
* @Last Modified time: 2016-11-18 00:33:32
*/

const EVENTS = require('../common/notification_event');
const ipcRenderer = require('electron').ipcRenderer;

class Notification2 extends window.Notification {
	constructor (title, opt) {
		opt.silent = true; // 保持安静
		super(title, opt);
		this.sound();
		// 在实例化完成之后，对onclick等方法进行改造
		setTimeout(() => {
			this.replaceOnClick();
		}, 16);
	}

	sound () {
		document.getElementById('notification-sound').play();
	}

	replaceOnClick () {
		if (this.onclick && typeof this.onclick === 'function') {
			const _onclick = this.onclick;
			this.onclick = () => {
				ipcRenderer.send(EVENTS.Notification_Show_Window, 'show_window');
				_onclick.call(this);
			};
		} else {
			this.onclick = () => {
				ipcRenderer.send(EVENTS.Notification_Show_Window, 'show_window');
			};
		}
	}
}

module.exports = Notification2;

