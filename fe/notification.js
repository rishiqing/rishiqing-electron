/*
* @Author: qinyang
* @Date:   2016-11-17 21:29:37
* @Last Modified by:   qinyang
* @Last Modified time: 2016-11-17 21:49:14
*/

var Notification2 = function (title, opt) {
	return window.Notification.apply(this, arguments);
};

Notification2.__proto__ = window.Notification;
Notification2.prototype.__proto__ = window.Notification.prototype;

module.exports = Notification2;

