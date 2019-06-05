const request = require('request');
const config = require('./config');
const BrowserWindow = require('electron').BrowserWindow;
const nativeImage   = require('electron').nativeImage;
const Notification = require('electron').Notification;
const autoUpdater = require('electron-updater').autoUpdater;
const pkg = require('../package.json');
const Sentry = require('./sentry');

class Update {
  constructor (mainWindow) {
    this.mainWindow = mainWindow;
    this.webContents = mainWindow.webContents;
    // this.initUpdate();
    this.setAutoUpdate();
  }
  initUpdate () {
    request.post({ 
      url: config.VERSIONURL, 
      headers: { 'User-Agent': this.webContents.getUserAgent() }
    }, (err, res, body) => {
      try {
        const versionInfo = JSON.parse(body).versionInfo;
        const version_code = versionInfo.version_code;
        if (version_code > config.VERSION) { // 说明有更新
          const win = new BrowserWindow({
            width: 300,
            height: 120,
            alwaysOnTop: true,
            resizable: false,
            webPreferences: {
              nodeIntegration: true
            },
            icon: nativeImage.createFromPath(__dirname + '/../res/icon_256x256.png')
          });
          win.loadURL('file://' + __dirname + '/../native/update/autoUpdate.html');
        }
      } catch (e) {  }
    });
  }
  setAutoUpdate () {
    autoUpdater.on('update-downloaded', function (info) {
      const notify = new Notification({
        title: `日事清V${info.version} 已准备就绪！`,
        body: `请退出当前应用，以便完成更新！`
      });
      notify.show();
    });
    autoUpdater.on('error', function (error) {
      const notify = new Notification({
        title: '日事清PC端自动更新出错了!!!',
        body: error.message
      });
      Sentry.captureException(new Error(error));
      notify.show();
    });
    if (pkg.env !== 'dev' && pkg.env !== 'debug') {
      autoUpdater.checkForUpdates();
    }
  }
}
module.exports = Update;