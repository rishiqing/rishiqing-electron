/*
* @Author: qinyang
* @Date:   2017-12-02 10:13:54
* @Last Modified by:   qinyang
* @Last Modified time: 2018-11-20 20:39:54
*/
var package           = require('../package.json');
var os                = require('os');
var nativeNotify      = require('./nativeNotify');
var notification      = require('./notification');
var $                 = require('jquery');
var electron          = require('electron');
var SentryEvent       = require('../common/sentry_event');
var platform          = process.platform;
var $mainIframe       = document.querySelector('#main-iframe');
var mainBroswerWindow = electron.remote.BrowserWindow.fromId(1);
var ipcRenderer       = electron.ipcRenderer;
var webContents       = mainBroswerWindow.webContents;
var db = mainBroswerWindow.mainDb;

var dealLogin = function (canAutoLogin) {
  if (!canAutoLogin) {
    $('.welcome-page').removeClass('hide');
    var Cookies = webContents.session.cookies
    Cookies.get({
      name: 'version',
    }, function(error, cookies) {
      ipcRenderer.send(SentryEvent.Sentry_Add_Breadcrumb, {
        category: 'version_cookies',
        message: JSON.stringify(cookies),
        level: 'error'
      });
      ipcRenderer.send(SentryEvent.Sentry_Capture_Message, 'Client_Can_Auto_Login_Error');
      $mainIframe.src = '';
    })
    // webContents.session.clearStorageData({
    //   storages: ['cookies'] // 清理cookie
    // });
  }
};

module.exports = function (mainWindow) {
  mainWindow.VERSIONSTAMP = {
    version: package.version,
    time: package.releaseTime || (new Date()).toString()
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

  mainWindow.onLogout = function () {
    $('.welcome-page').removeClass('hide');
    $mainIframe.src = '';
  }

  mainWindow.onHeaderDblclick = function () {
    if (platform !== 'darwin') return;
    if (mainBroswerWindow.isMaximized()) {
      mainBroswerWindow.unmaximize();
    } else {
      mainBroswerWindow.maximize();
    }
  }

  // 如果 Client_Can_Auto_Login 已经被赋过值了，则先用 dealLogin处理
  if (mainWindow.Client_Can_Auto_Login !== undefined) {
    dealLogin(mainWindow.Client_Can_Auto_Login);
  }

  var _Client_Can_Auto_Login = mainWindow.Client_Can_Auto_Login;
  mainWindow.Object.defineProperty(mainWindow, 'Client_Can_Auto_Login', {
    configurable: true,
    get: function () {
      return _Client_Can_Auto_Login;
    },
    set: function (v) {
      _Client_Can_Auto_Login = v;
      dealLogin(v);
    }
  });
};