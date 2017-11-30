/*
* @Author: qinyang
* @Date:   2017-11-30 10:24:39
* @Last Modified by:   qinyang
* @Last Modified time: 2017-11-30 10:28:49
*/

var $ = require('jquery');

module.exports = function (broswer) {
	$('.traffic-lights span').on('click', function (e) {
    var $currentTarget = $(e.currentTarget);
    if ($currentTarget.is('.close')) {
      broswer.close();
    } else if ($currentTarget.is('.minimize')) {
      // 全屏的时候，最小化不能用，这个需要在按钮上显示为灰色
      broswer.minimize();
    } else if ($currentTarget.is('.zoom')) {
      if (broswer.isFullScreen()) {
        broswer.setFullScreen(false);
      } else {
        broswer.setFullScreen(true);
      }
    }
  });
}