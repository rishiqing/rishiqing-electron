/*
* @Author: qin yang
* @Date:   2016-11-21 11:38:36
* @Last Modified by:   qin yang
* @Last Modified time: 2016-11-21 11:45:39
*/

var config = require('./config');

module.exports = function (location) {
	var host = location.host;
	var pathname = location.pathname;
	var thirdName = config.THIRD_LOGIN_HOST[host];
	var isSinaLogin;
	if (pathname.indexOf('sinaOauth') >= 0) {
		isSinaLogin = true;
	}
	if (thirdName || isSinaLogin) return true;
	return false;
}