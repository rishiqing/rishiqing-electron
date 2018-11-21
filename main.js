const electron      = require('electron');
const pkg           = require('./package.json');
const Menu          = require('./native/menu');
const Update        = require('./native/update');
const path          = require('path');
const download      = require('./download');
const preference    = require('./preference');
const mainDb        = require('./native/mainDb');
const WhiteUrlList  = require('./common/white_url_list');
const Sentry        = require('./native/sentry');
const { initProxy }   = require('./native/proxy');
const HotKeyConfig  = require('./native/hotkey');
const util          = require('./native/util');
const app           = electron.app;
const BrowserWindow = electron.BrowserWindow;
const nativeImage   = electron.nativeImage;
const shell         = electron.shell;
const session       = electron.session;

// chrome 66 之后，禁止了自动播放音乐，这会影响到通知铃声的播放
// 所以这里把这个禁止给解除了
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

if (process.platform !== 'darwin') app.setAppUserModelId('release.rishiqing.electron'); // 在这里设置appId，win10才能正常推送通知

Sentry.init();

class Main {
  constructor () {
    this.initAppEvent();
    this.detectSingleInstance();
  }

  // 检测单个运行实例，如果已经有一个在运行了，再点击软件图标，只会打开当前实例
  detectSingleInstance () {
    const gotTheLock = app.requestSingleInstanceLock()
    if (!gotTheLock) {
      app.quit();
      return
    } else {
      util.showWindow();
    }
  }

  initAppEvent () {
    app.on('ready', this._onReady.bind(this));
    app.on('window-all-closed', this._onWindowAllClosed.bind(this));
    // before-quit事件是在调用app.quit()之后第一个触发的事件
    app.on('before-quit', this._onBeforeQuit.bind(this));
  }

  async _onReady () {
    await HotKeyConfig();
    await initProxy();
    await this._createWindow();
    download.initWindow();
    preference.initWindow();
    const u = new Update(this.mainWindow);
    const m = new Menu(this.mainWindow);
  }

  async _createWindow () {
    let sizeDb = await mainDb.getWindowSize();
    this.mainWindow = new BrowserWindow({
      width: sizeDb.width,
      height: sizeDb.height,
      "title":"日事清",
      'webPreferences': {
        'plugins': true,
        'webSecurity': false,
        'nodeIntegration': true,
        'minimumFontSize': 12
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

  _onNewWindow (event, url, frameName, disposition, options) {
    if (!WhiteUrlList(url)) {
      event.preventDefault();
      shell.openExternal(url);
    } else {
      options.frame = true;
      options.webPreferences = Object.assign({}, options.webPreferences, {
        plugins: true,
        webSecurity: false,
        nodeIntegration: false,
        minimumFontSize: 12
      });
    }
  }

  _onWillDownload (event, item) {
    download.startDownload(item);
  }
}

new Main();
