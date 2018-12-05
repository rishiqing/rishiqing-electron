/*
* @Author: qinyang
* @Date:   2017-12-02 10:13:54
* @Last Modified by:   qinyang
* @Last Modified time: 2018-11-26 19:21:03
*/
var package           = require('../package.json');
var os                = require('os');
var nativeNotify      = require('./nativeNotify');
var notification      = require('./notification');
var $                 = require('jquery');
var electron          = require('electron');
var platform          = process.platform;
var $mainIframe       = document.querySelector('#main-iframe');
var mainBroswerWindow = electron.remote.BrowserWindow.fromId(1);
var db = mainBroswerWindow.mainDb;

var dealLogin = function (canAutoLogin) {
  if (!canAutoLogin) {
    $('.welcome-page').removeClass('hide');
    $mainIframe.src = '';
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

  mainWindow.Object.defineProperty(mainWindow.document, 'hidden', {
    configurable: true,
    get: function() {
      if (!mainBroswerWindow.isVisible()) return true;
      if (mainBroswerWindow.isMinimized()) return true;
      if (!mainBroswerWindow.isFocused()) return true;
      return false;
    },
    set: function() {}
  });

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