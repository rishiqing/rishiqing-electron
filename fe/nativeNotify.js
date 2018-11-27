/*
* @Author: qinyang
* @Date:   2016-11-16 21:08:26
* @Last Modified by:   qinyang
* @Last Modified time: 2018-11-21 17:46:28
*/
var ipcRenderer = require('electron').ipcRenderer;

var EVENTS = require('../common/notification_event');

var NativeNotify = function (title, options) {
	this.offEvents();
	this.initEvents();
	this.showNotification(title, options.body);
	this.notificationCome();
}

NativeNotify.requestPermission = function () {};
NativeNotify.permission = 'granted';

NativeNotify.prototype.showNotification = function (title, content) {
	ipcRenderer.send(EVENTS.Notification_Show_Message, { title: title, content: content });
}

NativeNotify.prototype.notificationCome = function() {
	ipcRenderer.send(EVENTS.Notification_Come);
}

NativeNotify.prototype.offEvents = function () {
	ipcRenderer.removeAllListeners(EVENTS.Notification_Show_reply);
	ipcRenderer.removeAllListeners(EVENTS.Notification_Click_reply);
	ipcRenderer.removeAllListeners(EVENTS.Notification_Close_reply);
}

NativeNotify.prototype.initEvents = function () {
	ipcRenderer.on(EVENTS.Notification_Show_reply, this.onNotificationShow.bind(this));
	ipcRenderer.on(EVENTS.Notification_Click_reply, this.onNotificationClick.bind(this));
	ipcRenderer.on(EVENTS.Notification_Close_reply, this.onNotificationClose.bind(this));
}

NativeNotify.prototype.onNotificationShow = function () {
	this.sound();
	if (this.onshow) this.onshow();
}

NativeNotify.prototype.onNotificationClick = function () {
	if (this.onclick) this.onclick();
}

NativeNotify.prototype.onNotificationClose = function () {
	if (this.onclose) this.onclose();
}

NativeNotify.prototype.sound = function () {
	document.getElementById('notification-sound').play();
}

NativeNotify.prototype.close = function () {}

module.exports = NativeNotify;