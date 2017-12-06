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
      { label: '显示主窗口', type: 'normal', click:() => { this.mainWindow.show(); }},
      { label: 'Item2', type: 'separator' },
      { label: '退出', type: 'normal',click:() => { global.force_close = true; app.quit(); }}
    ];
    this.initStartOnBoot();
  }
  initStartOnBoot () {
    if (platform.indexOf('win32') !== -1) { // 只在windows开启开机启动设置
      const startOnBoot = require("./startOnBoot");
      const bootMenu = { label: '开机启动', type: 'checkbox' ,checked:false, click:() => {
        startOnBoot.getAutoStartValue("rishiqing_startOnBoot",function(value,err){
          if(value){
            startOnBoot.disableAutoStart('rishiqing_startOnBoot');
          }else{
            startOnBoot.enableAutoStart('rishiqing_startOnBoot', process.execPath);
          }
        })
      }};
      startOnBoot.getAutoStartValue("rishiqing_startOnBoot",(value,err) => {
        if(value){
          bootMenu.checked = true;
        }else{
          bootMenu.checked = false;
        }
        this.menuList.unshift(bootMenu);
        const contextMenu = Menu.buildFromTemplate(this.menuList);
        this.appIcon.setContextMenu(contextMenu);
      })
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
