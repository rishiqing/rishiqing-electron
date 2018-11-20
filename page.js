const electron      = require('electron');
const path          = require('path');
const packageJson   = require('./package.json');
const BrowserWindow = electron.BrowserWindow;

class Page {
  get config () {
    return {};
  }
  get loadURL () {
    return '';
  }
  initWindow () {
    this.window = new BrowserWindow(Object.assign({
      title: '窗口名字',
      width: 380,
      height: 440,
      resizable: false,
      maximizable: false,
      minimizable: false,
      autoHideMenuBar: true,
      show: false // 初始化的时候不显示
    }, this.config));
    this.window.on('close', this._onWindowClose.bind(this));
    this.window.loadURL(this.loadURL);
    this.webContents = this.window.webContents;
    if (this._canOpenDevTools()) this.webContents.openDevTools();
  }

  open () {
    if (this.window) {
      this.window.show();
    }
  }

  _canOpenDevTools () {
    if (packageJson.env === 'dev' || packageJson.env === 'debug') return true;
    return false;
  }

  _onWindowClose (e) {
    this.window.hide();
    e.preventDefault();
  }
}

module.exports = Page