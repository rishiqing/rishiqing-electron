const electron      = require('electron');
const package       = require('./package.json');
const Menu          = require('./native/menu.js');
const Tray          = require('./native/tray.js');
const Update        = require('./native/update');
const Datastore     = require('nedb');
const path          = require('path');
const download      = require('./download');
const app           = electron.app;
const BrowserWindow = electron.BrowserWindow;
const nativeImage   = electron.nativeImage;
const shell         = electron.shell;

const db = new Datastore({ filename: path.join(app.getPath('userData'), 'nedb-main.json'), autoload: true });
async function findOne (query) {
  return new Promise((resolve, reject) => {
    db.findOne(query, function (err, doc) {
      if (err) reject(err);
      else resolve(doc);
    });
  });
}

let mainWindow, webContents;
async function createWindow () {
  let sizeDb = await findOne({ type: 'main-window-size' }) || {};
  mainWindow = new BrowserWindow({
    width: sizeDb.width || package.MIN_WINDOW_WIDTH,
    height: sizeDb.height || package.MIN_WINDOW_HEIGHT,
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
  mainWindow.mainDb = db;
  webContents = mainWindow.webContents;
  const userAgent = webContents.getUserAgent() + ' rishiqing-pc/' + package.version;
  webContents.setUserAgent(userAgent);
  mainWindow.loadURL(`file://${__dirname}/fe/index.html`);
  // 打开调试窗口
  if (package.env === 'dev' || package.env === 'debug') {
    webContents.openDevTools();
  }
  mainWindow.on('close', function (e) {
    if (!global.force_close) { // 这个force_close是在native/tray.js里设置的，当时点击托盘里的退出按钮时，被置为true
      if (process.platform === 'darwin') {
        if (mainWindow.isFullScreen()) {
          mainWindow.setFullScreen(false); // 如果是全屏状态，先退出全屏
        } else {
          app.hide();
        }
      } else {
        mainWindow.hide();
      }
      e.preventDefault();
    }
  });
  let resizeTimer = null;
  mainWindow.on('resize', function (e) {
    const size = mainWindow.getSize();
    const width = size[0];
    const height = size[1];
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeTimer = null;
      db.update({ type: 'main-window-size' }, { $set: { width, height } }, { upsert: true });
    }, 1000)
  });
  webContents.on('new-window', function (event, url, frameName, disposition, options) {
    // options.webPreferences.nodeIntegration = false;
    // options.icon = nativeImage.createFromPath(__dirname + '/res/rishiqing.png');
    event.preventDefault();
    shell.openExternal(url);
  });
  webContents.session.on('will-download', (event, item, webContents) => {
    download.startDownload(item);
  });
}

const shouldQuit = app.makeSingleInstance(function (argv, workingDirectory) {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    if (!mainWindow.isVisible()) mainWindow.show();
    mainWindow.focus();
  }
});
if (shouldQuit) {
  app.quit();
  return;
}

app.on('ready', async function () {
  await createWindow();
  download.initWindow();
  const u = new Update(mainWindow);
  const m = new Menu();
  const t = new Tray(mainWindow);
});
app.on('window-all-closed', function () {
  app.quit();
});
app.on('before-quit', function () {
  if (process.platform === 'darwin') app.exit(0);
});
