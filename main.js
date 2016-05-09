const electron = require('electron');
const config = require("./config");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;
function createWindow () {
  mainWindow = new BrowserWindow({
    width: config.MIN_WINDOW_WIDTH,
    height: config.MIN_WINDOW_HEIGHT,
    "minWidth":config.MIN_WINDOW_WIDTH,
    "minHeight":config.MIN_WINDOW_HEIGHT,
    "title":"日事清",
    'webPreferences': {
      'plugins': true,
      'webSecurity':false,
      "nodeIntegration":true
    }
  });
  mainWindow.loadURL('file://' + __dirname + '/fe/index.html');
  // 打开调试窗口
  mainWindow.webContents.openDevTools();
}
app.on('ready', createWindow);
