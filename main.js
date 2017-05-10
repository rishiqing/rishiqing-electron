const electron = require('electron');
const package  = require("./package.json");
const Menu     = require('./native/menu.js');
const Tray     = require('./native/tray.js');
const Update   = require('./native/update');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const nativeImage   = electron.nativeImage;

let mainWindow, webContents;
function createWindow () {
  mainWindow = new BrowserWindow({
    width: package.MIN_WINDOW_WIDTH,
    height: package.MIN_WINDOW_HEIGHT,
    "title":"日事清",
    'webPreferences': {
      'plugins': true,
      'webSecurity':false,
      "nodeIntegration":true
    },
    icon: nativeImage.createFromPath(__dirname + '/res/rishiqing.png') // 必须使用绝对路径，相对路径，在打包之后，icon无法显示
  });
  webContents = mainWindow.webContents;
  const userAgent = webContents.getUserAgent() + ' rishiqing-pc/' + package.version;
  webContents.setUserAgent(userAgent);
  mainWindow.loadURL('file://' + __dirname + '/fe/index.html');
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
  webContents.on('new-window', function (event, url, frameName, disposition, options) {
    options.webPreferences.nodeIntegration = false;
    options.icon = nativeImage.createFromPath(__dirname + '/res/rishiqing.png');
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

app.on('ready', function () {
  createWindow();
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
