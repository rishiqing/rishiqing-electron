/*
* @Author: qinyang
* @Date:   2017-11-30 10:24:39
* @Last Modified by:   qinyang
* @Last Modified time: 2017-12-14 15:59:31
*/

var $ = require('jquery');
var platform = process.platform;

module.exports = function (broswer) {
	$('.traffic-lights span').on('click', function (e) {
    var $currentTarget = $(e.currentTarget);
    if ($currentTarget.is('.close')) {
      broswer.close();
    } else if ($currentTarget.is('.minimize')) {
      // 全屏的时候，最小化不能用，这个需要在按钮上显示为灰色
      broswer.minimize();
    } else if ($currentTarget.is('.zoom')) {
      // 在windows平台就执行最大化，在其他平台就直接全屏
      if (platform === 'win32') {
        if (broswer.isMaximized()) {
          broswer.unmaximize();
        } else {
          broswer.maximize();
        }
      } else {
        if (broswer.isFullScreen()) {
          broswer.setFullScreen(false);
        } else {
          broswer.setFullScreen(true);
        }
      }
    }
  });
}