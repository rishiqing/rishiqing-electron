const electron    = require('electron');
const Tray        = electron.Tray;
const platform    = process.platform;
const tray_icon   = platform === 'darwin' ? '../res/tray_mac@2x.png' : '../res/tray_win.ico';
const app         = electron.app;
const Menu        = electron.Menu;
const path        = require('path');
const nativeImage = electron.nativeImage;

const IconImage   = nativeImage.createFromPath(path.join(__dirname, tray_icon));

class TrayClass {
  constructor (mainWindow) {
    this.mainWindow = mainWindow;
    this.initAppIcon();
    this.initEvent();
    this.initMenuList();
  }
  initAppIcon () {
    this.appIcon = new Tray(IconImage);
    this.appIcon.setToolTip('日事清');
    this.appIcon.on("clicked",() => {
      this.mainWindow.show();
    });
  }
  initEvent () {
    this.appIcon.on('click', () => {
      if (!this.mainWindow.isVisible()) {
        this.mainWindow.show();
        return;
      }
      if (this.mainWindow.isMinimized()) {
        this.mainWindow.restore();
        return;
      }
      this.mainWindow.hide();
      return;
    });
  }
  initMenuList () {
    this.menuList = [
      { label: 'Item2', type: 'separator' },
      { label: '显示主窗口', type: 'normal', click:() => { this.mainWindow.show(); }},
      { label: 'Item2', type: 'separator' },
      { label: '退出', type: 'normal',click:() => { global.force_close = true; app.quit(); }}
    ];
    if (platform === 'darwin') { // 如果是在os x系统
      const contextMenu = Menu.buildFromTemplate(this.menuList);
      this.appIcon.setContextMenu(contextMenu);
    }
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
}

module.exports = TrayClass;
