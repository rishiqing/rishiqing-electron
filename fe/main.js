/*
* @Author: apple
* @Date:   2016-02-17 17:11:07
* @Last Modified by:   apple
* @Last Modified time: 2016-02-26 17:32:59
*/

;(function () {
  var dns            = require('dns');
  var $              = require('jquery');
  var loading        = require('./loading')(window);
  var alertTip       = require('./alertTip')(window);
  var config         = require('./config');
  var $mainIframe    = document.querySelector('#main-iframe');
  var mainWindow     = $mainIframe.contentWindow;
  var platform       = process.platform;
  var alertTipTimer  = null;

  console.log('re load load begin');

  mainWindow.onerror = function () {
    console.log('onerror');
  }


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
      }
    });
  });

  $mainIframe.src = config.ACCOUNT_URL + '?_=' + new Date().getTime(); // 为了加载首页index的时候，不使用缓存

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

  $.ajax({
      url: config.VERSIONURL,
      type: 'POST',
      dataType: 'json',
      success: function (data) {
          var versionCode = data.versionInfo.version_code;
          if(versionCode > config.VERSION){
              // var gui = require('nw.gui');
              // var host = window.location.host;
              // gui.Window.open('app://rishiqing/fe/autoUpdate.html?version=' + versionCode, {
              //   "title":"日事清PC端有版本更新啦~~",
              //   "width": 500,//300
              //   "height": 100,//100
              //   "always_on_top": true,
              //   "focus": true,
              //   "frame": true,
              //   "show": true,
              //   "icon":"./res/icon.png",
              //   "toolbar": false,
              //   "max_width": 500,
              //   "max_height": 100,
              //   "min_width": 500,
              //   "min_height": 100,
              // });
          }
      }
  })
})();
