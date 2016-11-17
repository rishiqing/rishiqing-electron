/*
* @Author: qinyang
* @Date:   2016-11-16 21:08:26
* @Last Modified by:   qinyang
* @Last Modified time: 2016-11-17 13:40:44
*/
var ipcRenderer = require('electron').ipcRenderer;

var EVENTS = require('../common/notification_event');

class NativeNotify {
	static requestPermission () {}
	static get permission () {
		return 'granted';
	}
	constructor (title, options) {
		this.offEvents();
		this.initEvents();
		this.showNotification(title, options.body);
	}

	showNotification (title, content) {
		ipcRenderer.send(EVENTS.Notification_Show_Message, { title: title, content: content });
	}

	offEvents () {
		ipcRenderer.removeAllListeners(EVENTS.Notification_Show_reply);
		ipcRenderer.removeAllListeners(EVENTS.Notification_Click_reply);
		ipcRenderer.removeAllListeners(EVENTS.Notification_Close_reply);
	}

	initEvents () {
		ipcRenderer.on(EVENTS.Notification_Show_reply, this.onNotificationShow.bind(this));
		ipcRenderer.on(EVENTS.Notification_Click_reply, this.onNotificationClick.bind(this));
		ipcRenderer.on(EVENTS.Notification_Close_reply, this.onNotificationClose.bind(this));
	}

	onNotificationShow () {
		if (this.onshow) this.onshow();
	}

	onNotificationClick () {
		if (this.onclick) this.onclick();
	}

	onNotificationClose () {
		if (this.onclose) this.onclose();
	}

	close () {
		
	}
}

module.exports = NativeNotify;