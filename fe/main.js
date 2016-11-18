/*
* @Author: apple
* @Date:   2016-02-17 17:11:07
* @Last Modified by:   qin yang
* @Last Modified time: 2016-11-18 13:41:51
*/

;(function () {
  var dns            = require('dns');
  var $              = require('jquery');
  var loading        = require('./loading')(window);
  var alertTip       = require('./alertTip')(window);
  var package        = require('../package.json');
  var config         = require('./config');
  var wxAuthPatch    = require('./wxAuthPatch');
  var nativeNotify   = require('./nativeNotify');
  var notification   = require('./notification');
  var $mainIframe    = document.querySelector('#main-iframe');
  var mainWindow     = $mainIframe.contentWindow;
  var platform       = process.platform;
  var alertTipTimer  = null;
  var os             = require('os');

  $mainIframe.addEventListener('load', function () {
    dns.lookup('www.rishiqing.com', function (err) {
      if (err) {
        loading.show('networkError');
      } else {
        var href = mainWindow.location.href;
        if (href === config.ACCOUNT_URL) {
          loading.hide();
        } else {
          loading.hide();
        }
        var host = mainWindow.location.host, isInThirdLoginPage;
        if (config.THIRD_LOGIN_HOST[host]) {
          // 由于微信检测了是否在iframe里面执行，而且还要检测最外层的window的host是否为空,如果不为空才跳转
          // 而情况就是这么巧，electron在file协议下加载的index.html，host是空的
          // 期间就想各种办法，看能不能恢复host，各种试了protocol自定义，结果还是徒劳，
          // 相对这一点，nw就做得要好一些，至少他们的自定义protocol的Host不是空的，所以之前在nw里，微信登录才能用
          // 纠结之纠结，终于找到了这么个奇淫技巧，拦截微信授权页下面的ajax请求，我们自己控制跳转.
          if (host === config.weixinOauthUrl) {
            wxAuthPatch(mainWindow, config.WX_REDIRECT);
          }
          isInThirdLoginPage = true;
          var keyTip = process.platform === 'win32' ? 'Backspace' : 'delete';
          alertTip.show(config.THIRD_LOGIN_HOST[host] + '登录页面 可按 ' + keyTip + ' 键返回');
          if (alertTipTimer) {
            clearTimeout(alertTipTimer);
            alertTipTimer = null;
          }
          alertTipTimer = setTimeout(function () {
            alertTip.hide();
          }, 4000);
        }
        var handleBar = function (pressed) {
          if (platform === 'win32') {
            if (pressed.which === 116) {
              loading.show();
              mainWindow.location.reload();
            }
          } else if (platform === 'darwin') {
            if (pressed.metaKey && pressed.which === 82) {
              loading.show();
              mainWindow.location.reload();
            }
          }
          if (pressed.which === 8 && isInThirdLoginPage) { // 如果在第三方登陆页，并且按了delete键，则倒退
            mainWindow.history.back();
          }
        };
        mainWindow.document.removeEventListener('keydown', handleBar);
        mainWindow.document.addEventListener('keydown', handleBar, false);
        // 由于electron iframe 下面，不支持 confirm 和 alert ,这里就把外层的confirm 和 alert 方法赋值给iframe里面
        mainWindow.confirm = function (message) {
          return window.confirm(message, '日事清');
        };
        mainWindow.alert   = function (message) {
          return window.alert(message, '日事清');
        };
        // 替换我们基于windows.Notification开发的通知模块，主要针对在win7下，只能使用balloon进行通知的问题
        if (platform === 'win32') {
          var release = os.release();
          var first = parseInt(release.split('.')[0], 10);
          if (first !== 10) { // 判断在windows以下都用自己开发的Notification来进行通知
            mainWindow.Notification = nativeNotify; 
          } else { // 如果是win10
            mainWindow.Notification = notification;
          }
        }
        if (platform === 'darwin') {
          mainWindow.Notification = notification;
        }
      }
    });
  });

  if (package.env === 'debug') {
    $mainIframe.src = package['debug-url'];
  } else {
    $mainIframe.src = config.ACCOUNT_URL + '?_=' + new Date().getTime(); // 为了加载首页index的时候，不使用缓存
  }

  // 在local页面监听键盘，刷新
  var localHandleBar = function (pressed) {
    if (platform === 'win32') {
      if (pressed.which === 116) {
        loading.show();
        mainWindow.location.reload();
      }
    } else if (platform === 'darwin') {
      if (pressed.metaKey && pressed.which === 82) {
        loading.show();
        mainWindow.location.reload();
      }
    }
  };
  document.removeEventListener('keydown', localHandleBar);
  document.addEventListener('keydown', localHandleBar, false);
})();
