require('./registerHelper');
require('./ui/modal');
var WelcomPageView      = require('./welcomePage');
var dns                 = require('dns');
var $                   = require('jquery');
var querystring         = require('querystring');
var loading             = require('./loading')();
var alertTip            = require('./alertTip')();
var package             = require('../package.json');
var config              = require('./config');
var wxAuthPatch         = require('./wxAuthPatch');
var checkThirdLoginPage = require('./checkThirdLoginPage');
var rishiqingWeb        = require('./rishiqingWeb');
var $mainIframe         = document.querySelector('#main-iframe');
var mainWindow          = $mainIframe.contentWindow;
var platform            = process.platform;
var alertTipTimer       = null;
var os                  = require('os');
var electron            = require('electron');
var dragBar             = require('./drag-bar');

var mainBroswerWindow   = electron.remote.BrowserWindow.fromId(1);
var shell               = electron.shell;
var db                  = mainBroswerWindow.mainDb;
const webFrame          = electron.webFrame;

webFrame.setZoomFactor(1);
webFrame.setVisualZoomLevelLimits(1, 1);
webFrame.setLayoutZoomLevelLimits(0, 0);

(mainBroswerWindow.webContents || mainBroswerWindow.getWebContents()).on('context-menu', function (e, props) {
  var menuTpl = [
    {
      label: '撤销',
      accelerator: 'CommandOrControl+Z',
      role: 'undo'
    },
    {
      label: '重做',
      accelerator: 'CommandOrControl+Y',
      role: 'redo'
    },
    {
      type: 'separator'
    },
    {
      label: '剪切',
      accelerator: 'CommandOrControl+X',
      role: 'cut'
    },
    {
      label: '复制',
      accelerator: 'CommandOrControl+C',
      role: 'copy'
    },
    {
      label: '粘贴',
      accelerator: 'CommandOrControl+V',
      role: 'paste'
    },
    {
      label: '全选',
      accelerator: 'CommandOrControl+A',
      role: 'selectall'
    },
    {
      type: 'separator'
    },
    {
      label: '前进',
      visible: true,
      click: function () {
        forwardWindow();
      }
    }, 
    {
      label: '后退',
      visible: true,
      click: function () {
        backWindow();
      }
    }, 
    {
      label: '刷新',
      visible: true,
      accelerator: 'CommandOrControl+R',
      click: function () {
        reloadWindow();
      }
    }
  ];
  var menu = (electron.Menu || electron.remote.Menu).buildFromTemplate(menuTpl);
  menu.popup(mainBroswerWindow);
});

var isReloading = false;

function reloadWindow () {
  isReloading = true;
  loadingShow();
  mainWindow.location.reload();
}

function backWindow () {
  mainWindow.history.back();
}

function forwardWindow () {
  mainWindow.history.forward();
}

// 判断mainWindow是不是 app page
function isAppPage () {
  var href = mainWindow.location.href;
  if (href && href.indexOf(config.WEBSITE + 'app') === 0) {
    return true;
  } else return false;
}

function loadingShow () {
  if (isAppPage()) loading.show('pureColor');
  else loading.show();
}

$mainIframe.addEventListener('load', function () {
  isReloading = false;
  dns.lookup('www.rishiqing.com', function (err) {
    if (err) {
      loading.show('networkError');
      return;
    }
    var href = mainWindow.location.href;
    loading.hide();
    var host = mainWindow.location.host, isInThirdLoginPage;
    if (checkThirdLoginPage(mainWindow.location)) {
      // 由于微信检测了是否在iframe里面执行，而且还要检测最外层的window的host是否为空,如果不为空才跳转
      // 而情况就是这么巧，electron在file协议下加载的index.html，host是空的
      // 期间就想各种办法，看能不能恢复host，各种试了protocol自定义，结果还是徒劳，
      // 相对这一点，nw就做得要好一些，至少他们的自定义protocol的Host不是空的，所以之前在nw里，微信登录才能用
      // 纠结之纠结，终于找到了这么个奇淫技巧，拦截微信授权页下面的ajax请求，我们自己控制跳转.
      if (host === config.weixinOauthUrl) {
        var query = querystring.parse(mainWindow.location.search.split('?')[1]);
        var state = query.state;
        wxAuthPatch(mainWindow, { redirect: config.WX_REDIRECT, state: state });
      }
      isInThirdLoginPage = true;
      var keyTip = process.platform === 'win32' ? 'Backspace' : 'delete';
      alertTip.show((config.THIRD_LOGIN_HOST[host] || '第三方') + '登录页面 可按 ' + keyTip + ' 键返回');
      if (alertTipTimer) {
        clearTimeout(alertTipTimer);
        alertTipTimer = null;
      }
      alertTipTimer = setTimeout(function () {
        alertTipTimer = null;
        alertTip.hide();
      }, 4000);
    }
    var handleBar = function (pressed) {
      if (platform === 'win32') {
        if (pressed.which === 116) {
          loadingShow();
          mainWindow.location.reload();
        }
      } else if (platform === 'darwin') {
        if (pressed.metaKey && pressed.which === 82) {
          loadingShow();
          mainWindow.location.reload();
        }
      }
      if (pressed.which === 8 && isInThirdLoginPage) { // 如果在第三方登陆页，并且按了delete键，则倒退
        var type = pressed.target.type;
        var readonly = pressed.target.readOnly;
        var contentEditable = pressed.target.contentEditable;
        if (type !== 'textarea' && type !== 'text' && type !== 'password' && contentEditable !== 'true') {
          mainWindow.history.back();
        } else if (readonly) {
          mainWindow.history.back();
        }
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
    
    // 覆盖docment.hidden主要用在通知的判断，因为通知在document。hidden 为 false 的时候不会发通知
    mainWindow.Object.defineProperty(mainWindow.document, 'hidden', {
      configurable: true,
      get: function () {
        return !mainBroswerWindow.isFocused();
      }
    });

    if (mainWindow.I_AM_RSQ_WEB) {
      rishiqingWeb(mainWindow);
    }
  });
});

async function getServerConfig () {
  const serverConfig = await db.getServerConfig();
  if (package.env === 'debug') {
    $mainIframe.src = package['debug-url'];
  } else {
    $mainIframe.src = serverConfig[`${serverConfig['server-type']}-server-name`] + '/app';
  }
}

getServerConfig();


// // 在local页面监听键盘，刷新
// var localHandleBar = function (pressed) {
//   if (platform === 'win32') {
//     if (pressed.which === 116) {
//       reloadWindow();
//     }
//   } else if (platform === 'darwin') {
//     if (pressed.metaKey && pressed.which === 82) {
//       reloadWindow();
//     }
//   }
// };
// document.removeEventListener('keydown', localHandleBar);
// document.addEventListener('keydown', localHandleBar, false);
if (platform === 'win32') {
  $(document.body).addClass('win');
} else if (platform === 'darwin') {
  $(document.body).addClass('mac');
}
var welcomPage = new WelcomPageView({
  onLogin: function (url) {
    $mainIframe.src = url;
  },
  onSign: function (url) {
    $mainIframe.src = url;
  }
});
$(document.body).append(welcomPage.$el);
dragBar(mainBroswerWindow);
