const Notification = require('electron').Notification;
const autoUpdater = require('electron-updater').autoUpdater;
const pkg = require('../package.json');
const Sentry = require('./sentry');

class Update {
  constructor (mainWindow) {
    this.mainWindow = mainWindow;
    this.webContents = mainWindow.webContents;
    this.setAutoUpdate();
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
