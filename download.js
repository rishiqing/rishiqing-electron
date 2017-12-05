const electron      = require('electron');
const path          = require('path');
const packageJson   = require('./package.json');
const EVENTS        = require('./common/download_event');
const BrowserWindow = electron.BrowserWindow;
const ipcMain       = electron.ipcMain;
const app           = electron.app;

let downloadIdCount = 0;

const DownloadItemIdMap = {}; // 缓存下载对象和itemId之间的映射关系

class Download {
  constructor () {
    this.initEvent()
  }
  initEvent () {
    ipcMain.on(EVENTS.Cancel_Download, this.onCancelItem.bind(this));
  }
  initWindow () {
    this.window = new BrowserWindow({
      title: '下载管理',
      width: 380,
      height: 440,
      resizable: false,
      maximizable: false,
      minimizable: false,
      show: false // 初始化的时候不显示
    });
    this.window.on('close', this._onWindowClose.bind(this));
    this.window.loadURL(`file://${path.join(__dirname, '/fe/download/index.html')}`);
    this.webContents = this.window.webContents;
    if (packageJson.env === 'dev' || packageJson.env === 'debug'){
      // this.webContents.openDevTools();
    }
  }

  open () {
    if (this.window) {
      this.window.show();
    }
  }

  startDownload (item) {
    // 下载项先暂时默认保存到下载路径里，后面需要增加用户修改默认保存路径的功能
    item.setSavePath(path.join(app.getPath('downloads'), item.getFilename()));
    item.id = ++downloadIdCount;
    DownloadItemIdMap[item.id] = item;
    this.open();
    this.webContents.send(EVENTS.Start, {
      savePath: item.getSavePath(),
      itemId: item.id,
      originUrl: item.getURL(),
      mimeType: item.getMimeType(),
      hasUserGesture: item.hasUserGesture(),
      fileName: item.getFilename(),
      totalBytes: item.getTotalBytes(),
      receivedBytes: item.getReceivedBytes(),
      contentDisposition: item.getContentDisposition(),
      urlChain: item.getURLChain(),
      lastModifiedTime: item.getLastModifiedTime(),
      eTag: item.getETag(),
      startTime: item.getStartTime()
    });
    item.on('updated', (e, state) => {
      if (state === 'interrupted') {
        this.webContents.send(EVENTS.Interrupted, {
          itemId: item.id
        });
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          this.webContents.send(EVENTS.Paused, {
            itemId: item.id
          });
        } else {
          const bytes = item.getReceivedBytes();
          this.webContents.send(EVENTS.Progress, {
            itemId: item.id,
            totalBytes: item.getTotalBytes(),
            receivedBytes: item.getReceivedBytes()
          });
        }
      }
    });
    item.once('done', (e, state) => {
      if (state === 'completed') {
        this.webContents.send(EVENTS.Completed, {
          itemId: item.id
        });
      } else if (state === 'cancelled') {
        this.webContents.send(EVENTS.Done_Cancelled, {
          itemId: item.id
        });
      } else if (state === 'interrupted') {
        this.webContents.send(EVENTS.Done_Interrupted, {
          itemId: item.id
        });
      }
      delete DownloadItemIdMap[item.id];
    });
  }

  onCancelItem (e, itemId) {
    const item = DownloadItemIdMap[itemId];
    if (item) item.cancel();
  }

  _onWindowClose (e) {
    this.window.hide();
    e.preventDefault();
  }
}

module.exports = new Download();