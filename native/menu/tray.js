const electron    = require('electron');
const {ipcMain}   = require('electron');
const download    = require('../../download');
const util        = require('../util');
const path        = require('path');
const EVENTS      = require('../../common/notification_event');
const env         = require('../../common/env');
const Icon        = require('./icon');
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
    // this.initMenuList();
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
  // initMenuList () {
  //   this.menuList = [
  //     { label: 'Item2', type: 'separator' },
  //     { label: '下载管理', type: 'normal', click:() => { download.open(); }},
  //     { label: 'Item2', type: 'separator' },
  //     { label: '清除缓存', type: 'normal', click:() => { util.clearCache(); } },
  //     { label: 'Item2', type: 'separator' },
  //     { label: '显示主窗口', type: 'normal', click:() => { this.mainWindow.show(); }},
  //     { label: 'Item2', type: 'separator' },
  //     { label: '退出', type: 'normal',click:() => { global.force_close = true; app.quit(); }}
  //   ];
  //   this.initStartOnBoot();
  // }
  // getAutoStartValue (callback) {
  //   const startOnBoot = require("./startOnBoot");
  //   const old_key = 'rishiqing_startOnBoot'; // 之前版本保存自动启动地址的key
  //   const new_key = 'rishiqing_V3'; // 新版的自启动key
  //   // 先检测是否有老版本的自启动配置
  //   startOnBoot.getAutoStartValue(old_key, (old_value, err) => {
  //     if (old_value) {
  //       // 如果有，就先移除老版本的自启动
  //       startOnBoot.disableAutoStart(old_key);
  //       // 然后把新版本的自启动配置给写进去
  //       startOnBoot.enableAutoStart(new_key, process.execPath);
  //       callback(process.execPath);
  //     } else {
  //       // 如果没有配置老版本的自启动
  //       startOnBoot.getAutoStartValue(new_key, (new_value, err) => {
  //         let v = new_value;
  //         if (new_value && new_value !== process.execPath) {
  //           // 如果当前配置的启动地址，和当前的不一样，就修改掉
  //           startOnBoot.enableAutoStart(new_key, process.execPath);
  //           v = process.execPath;
  //         }
  //         callback(v);
  //       });
  //     }
  //   });
  // }
  // initStartOnBoot () {
  //   if (platform.indexOf('win32') !== -1) { // 只在windows开启开机启动设置
  //     const startOnBoot = require("./startOnBoot");
  //     const new_key = 'rishiqing_V3'; // 新版的自启动key
  //     const bootMenu = { label: '开机启动', type: 'checkbox' ,checked:false, click:() => {
  //       this.getAutoStartValue((value) => {
  //         if(value){
  //           startOnBoot.disableAutoStart(new_key);
  //         }else{
  //           startOnBoot.enableAutoStart(new_key, process.execPath);
  //         }
  //       });
  //     }};
  //     this.getAutoStartValue((value) => {
  //       if(value){
  //         bootMenu.checked = true;
  //       }else{
  //         bootMenu.checked = false;
  //       }
  //       this.menuList.unshift(bootMenu);
  //       const contextMenu = Menu.buildFromTemplate(this.menuList);
  //       this.appIcon.setContextMenu(contextMenu);
  //     });
  //   }
  // }
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
