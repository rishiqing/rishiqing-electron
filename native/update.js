const request = require('request');
const config = require('../fe/config');
const BrowserWindow = require('electron').BrowserWindow;
class Update {
  constructor (mainWindow) {
    this.mainWindow = mainWindow;
    this.initUpdate();
  }
  initUpdate () {
    request.post(config.VERSIONURL, (err, res, body) => {
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
          });
          win.loadURL('file://' + __dirname + '/../fe/autoUpdate.html');
        }
      } catch (e) {

      }
    });
  }
}
module.exports = Update;
