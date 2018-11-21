const electron    = require('electron');
const {ipcMain}   = require('electron');
const download    = require('../../download');
const util        = require('../util');
const path        = require('path');
const EVENTS      = require('../../common/notification_event');
const env         = require('../../common/env');
const Icon        = require('./icon');
const autoLaunch  = require('../autoLaunch');
const {
  Tray,
  app,
  Menu,
} = electron;

class TrayClass {
  constructor (mainWindow) {
    this.mainWindow = mainWindow;
    this.webContents = mainWindow.webContents;
    this.initAppIcon();
    this.initEvent();
    setTimeout(() => {
      this.clearOldStartConfig();
    }, 0)
  }
  initAppIcon () {
    this.appIcon = new Tray(Icon.getImage());
    this.appIcon.setToolTip('日事清');
    if (env.isMac) {
      this.appIcon.setPressedImage(Icon.getPressedImage());
    }
    this.initNotificationEvent();
    this.initBalloonEvent();
  }
  initNotificationEvent () {
    ipcMain.on(EVENTS.Notification_Show_Message, this.onNotificationShow.bind(this));
    ipcMain.on(EVENTS.Notification_Show_Window, this.onNotificationShowWindow.bind(this));
  }
  initBalloonEvent () {
    this.appIcon.on('balloon-show', this.onBalloonShow.bind(this));
    this.appIcon.on('balloon-click', this.onBalloonClick.bind(this));
    this.appIcon.on('balloon-closed', this.onBalloonClosed.bind(this));
  }
  initEvent () {
    this.appIcon.on('click', () => {
      const result = util.showWindow();
      if (env.platform === 'win') {
        if (!result) this.mainWindow.hide();
      }
    });
    // mac系统需要监听操作系统的主题变化
    if (env.isMac) {
      Icon.event.on(Icon.EVENTS.ThemeChange, () => {
        this.appIcon.setImage(Icon.getImage());
      })
    }
  }
  // 清理windows旧版本的的开机启动配置
  clearOldStartConfig() {
    const startOnBoot = require("./startOnBoot");
    const old_key_1 = 'rishiqing_startOnBoot'; // 之前版本保存自动启动地址的key
    const old_key_2 = 'rishiqing_V3'; // 新版的自启动key
    let on = false;
    startOnBoot.getAutoStartValue(old_key_1, (value) => {
      if (value) {
        on = true;
        startOnBoot.disableAutoStart(old_key_1);
      }
    });
    startOnBoot.getAutoStartValue(old_key_2, (value) => {
      if (value) {
        on = true;
        startOnBoot.disableAutoStart(old_key_2);
      }
    });
    if (on) {
      autoLaunch.enable();
    }
  }
  setContextMenu(m) {
    this.appIcon.setContextMenu(m);
  }
  // 显示 tray 通知
  showBalloon (title, content) {
    this.appIcon.displayBalloon({
      title: title || '',
      content: content || ''
    });
  }
  onBalloonShow () {
    this.webContents.send(EVENTS.Notification_Show_reply, 'show');
  }
  onBalloonClick () {
    util.showWindow();
    this.webContents.send(EVENTS.Notification_Click_reply, 'click');
  }
  onBalloonClosed () {
    this.webContents.send(EVENTS.Notification_Close_reply, 'close');
  }
  onNotificationShow (event, arg) {
    if (this.mainWindow.isFocused()) return;
    if (arg) {
      this.showBalloon(arg.title || '', arg.content || '');
    }
  }
  onNotificationShowWindow () {
    util.showWindow();
  }
}

module.exports = TrayClass;
