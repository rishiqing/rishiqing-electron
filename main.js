const electron      = require('electron');
const pkg           = require('./package.json');
const Menu          = require('./native/menu.js');
const Tray          = require('./native/tray.js');
const Update        = require('./native/update');
const Datastore     = require('nedb');
const path          = require('path');
const download      = require('./download');
const mainDb        = require('./native/mainDb');
const app           = electron.app;
const BrowserWindow = electron.BrowserWindow;
const nativeImage   = electron.nativeImage;
const shell         = electron.shell;

// const db = new Datastore({ filename: path.join(app.getPath('userData'), 'nedb-main.json'), autoload: true });
// async function findOne (query) {
//   return new Promise((resolve, reject) => {
//     db.findOne(query, function (err, doc) {
//       if (err) reject(err);
//       else resolve(doc);
//     });
//   });
// }

class Main {
  constructor () {
    this.initAppEvent();
    this.detectSingleInstance();
  }

  // 检测单个运行实例，如果已经有一个在运行了，再点击软件图标，只会打开当前实例
  detectSingleInstance () {
    const shouldQuit = app.makeSingleInstance(function (argv, workingDirectory) {
      if (this.mainWindow) {
        if (this.mainWindow.isMinimized()) this.mainWindow.restore();
        if (!this.mainWindow.isVisible()) this.mainWindow.show();
        this.mainWindow.focus();
      }
    });
    if (shouldQuit) {
      app.quit();
      return;
    }
  }

  initAppEvent () {
    app.on('ready', this._onReady.bind(this));
    app.on('window-all-closed', this._onWindowAllClosed.bind(this));
    // before-quit事件是在调用app.quit()之后第一个触发的事件
    app.on('before-quit', this._onBeforeQuit.bind(this));
  }

  async _onReady () {
    await this._createWindow();
    download.initWindow();
    const u = new Update(this.mainWindow);
    const m = new Menu();
    const t = new Tray(this.mainWindow);
  }

  async _createWindow () {
    let sizeDb = await mainDb.getWindowSize();
    this.mainWindow = new BrowserWindow({
      width: sizeDb.width || pkg.MIN_WINDOW_WIDTH,
      height: sizeDb.height || pkg.MIN_WINDOW_HEIGHT,
      "title":"日事清",
      'webPreferences': {
        'plugins': true,
        'webSecurity':false,
        "nodeIntegration":true
      },
      frame: false,
      backgroundColor: '#ffffff',
      icon: nativeImage.createFromPath(__dirname + '/res/rishiqing.png') // 必须使用绝对路径，相对路径，在打包之后，icon无法显示
    });
    this.mainWindow.mainDb = mainDb;
    const webContents = this.mainWindow.webContents;
    const userAgent = webContents.getUserAgent() + ' rishiqing-pc/' + pkg.version;
    webContents.setUserAgent(userAgent);
    this.mainWindow.loadURL(`file://${__dirname}/fe/index.html`);
    // 打开调试窗口
    if (pkg.env === 'dev' || pkg.env === 'debug') {
      webContents.openDevTools();
    }
    this.mainWindow.on('close', this._onWindowClose.bind(this));
    this.mainWindow.on('resize', this._onResize.bind(this));
    webContents.on('new-window', this._onNewWindow.bind(this));
    webContents.session.on('will-download', this._onWillDownload.bind(this));
  }

  _onWindowAllClosed () {
    app.quit();
  }

  _onBeforeQuit () {
    app.exit(0);
  }

  _onResize () {
    const size = this.mainWindow.getSize();
    const width = size[0];
    const height = size[1];
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.resizeTimer = null;
      mainDb.updateWindowSize({ width, height });
    }, 1000)
  }

  _onWindowClose (e) {
    if (!global.force_close) { // 这个force_close是在native/tray.js里设置的，当时点击托盘里的退出按钮时，被置为true
      if (process.platform === 'darwin') {
        if (this.mainWindow.isFullScreen()) {
          this.mainWindow.setFullScreen(false); // 如果是全屏状态，先退出全屏
        } else {
          app.hide();
        }
      } else {
        this.mainWindow.hide();
      }
      e.preventDefault();
    } 
  }

  _onNewWindow (event, url) {
    event.preventDefault();
    shell.openExternal(url);
  }

  _onWillDownload (event, item) {
    download.startDownload(item);
  }
}

new Main();
