const electron    = require('electron');
const {ipcMain}   = require('electron');
const download    = require('../download');
const Tray        = electron.Tray;
const platform    = process.platform;
const tray_icon   = platform === 'darwin' ? '../res/tray_mac@2x.png' : '../res/tray_win.ico';
const tray_icon_pressed = '../res/tray_mac_pressed@2x.png';
const app         = electron.app;
const Menu        = electron.Menu;
const path        = require('path');
const nativeImage = electron.nativeImage;
const EVENTS      = require('../common/notification_event');
const dialog      = electron.dialog;
const session     = electron.session;
const Notification = electron.Notification;

const IconImage   = nativeImage.createFromPath(path.join(__dirname, tray_icon));
const IconImagePressed = nativeImage.createFromPath(path.join(__dirname, tray_icon_pressed));

class TrayClass {
  constructor (mainWindow) {
    this.mainWindow = mainWindow;
    this.webContents = mainWindow.webContents;
    this.initAppIcon();
    this.initEvent();
    this.initMenuList();
  }
  initAppIcon () {
    this.appIcon = new Tray(IconImage);
    this.appIcon.setToolTip('日事清');
    if (platform === 'darwin') {
      this.appIcon.setPressedImage(IconImagePressed);
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
      const result = this.showWindow();
      if (platform === 'win32') {
        if (!result) this.mainWindow.hide();
      }
    });
  }
  showWindow () {
    let show = false;
    if (!this.mainWindow.isVisible()) {
      this.mainWindow.show();
      this.mainWindow.focus();
      show = true;
    }
    if (this.mainWindow.isMinimized()) {
      this.mainWindow.restore();
      this.mainWindow.focus();
      show = true;
    }
    if (!show && !this.mainWindow.isFocused()) {
      this.mainWindow.focus();
      show = true;
    }
    return show;
  }
  initMenuList () {
    this.menuList = [
      { label: 'Item2', type: 'separator' },
      { label: '下载管理', type: 'normal', click:() => { download.open(); }},
      { label: 'Item2', type: 'separator' },
      { label: '清除缓存', type: 'normal', click:() => { this.clearCache(); } },
      { label: 'Item2', type: 'separator' },
      { label: '显示主窗口', type: 'normal', click:() => { this.mainWindow.show(); }},
      { label: 'Item2', type: 'separator' },
      { label: '退出', type: 'normal',click:() => { global.force_close = true; app.quit(); }}
    ];
    this.initStartOnBoot();
  }
  clearCache () {
    dialog.showMessageBox({
      type: 'warning',
      buttons: ['确定', '取消'],
      defaultId: 0,
      title: '确认清除缓存?',
      message: '清除缓存可能导致您退出日事清账号,需要重启后生效'
    }, function(response) {
      if (response === 1) return;
      if (response === 0) {
        // 只清除cookies，会清除用户的登录状态
        session.defaultSession.clearStorageData({
          storages: ['cookies'] // 清理 cookie
        })
        // 清除网络缓存文件
        session.defaultSession.clearCache(function() {
          const notify = new Notification({
            title: '缓存已清理',
            body: '需要重启软件后生效'
          });
          notify.show();
        })
      }
    })
  }
  getAutoStartValue (callback) {
    const startOnBoot = require("./startOnBoot");
    const old_key = 'rishiqing_startOnBoot'; // 之前版本保存自动启动地址的key
    const new_key = 'rishiqing_V3'; // 新版的自启动key
    // 先检测是否有老版本的自启动配置
    startOnBoot.getAutoStartValue(old_key, (old_value, err) => {
      if (old_value) {
        // 如果有，就先移除老版本的自启动
        startOnBoot.disableAutoStart(old_key);
        // 然后把新版本的自启动配置给写进去
        startOnBoot.enableAutoStart(new_key, process.execPath);
        callback(process.execPath);
      } else {
        // 如果没有配置老版本的自启动
        startOnBoot.getAutoStartValue(new_key, (new_value, err) => {
          let v = new_value;
          if (new_value && new_value !== process.execPath) {
            // 如果当前配置的启动地址，和当前的不一样，就修改掉
            startOnBoot.enableAutoStart(new_key, process.execPath);
            v = process.execPath;
          }
          callback(v);
        });
      }
    });
  }
  initStartOnBoot () {
    if (platform.indexOf('win32') !== -1) { // 只在windows开启开机启动设置
      const startOnBoot = require("./startOnBoot");
      const new_key = 'rishiqing_V3'; // 新版的自启动key
      const bootMenu = { label: '开机启动', type: 'checkbox' ,checked:false, click:() => {
        this.getAutoStartValue((value) => {
          if(value){
            startOnBoot.disableAutoStart(new_key);
          }else{
            startOnBoot.enableAutoStart(new_key, process.execPath);
          }
        });
      }};
      this.getAutoStartValue((value) => {
        if(value){
          bootMenu.checked = true;
        }else{
          bootMenu.checked = false;
        }
        this.menuList.unshift(bootMenu);
        const contextMenu = Menu.buildFromTemplate(this.menuList);
        this.appIcon.setContextMenu(contextMenu);
      });
    }
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
    this.showWindow();
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
    this.showWindow();
  }
}

module.exports = TrayClass;
