const electron      = require('electron');
const path          = require('path');
const packageJson   = require('./package.json');
const EVENTS        = require('./common/download_event');
const FileUtil      = require('./utils/file');
const BrowserWindow = electron.BrowserWindow;
const ipcMain       = electron.ipcMain;
const app           = electron.app;

let downloadIdCount = 0;

const DownloadPath = app.getPath('downloads'); // 下载路径
const DownloadItemIdMap = {}; // 缓存下载对象和itemId之间的映射关系
const DownloadFileNameMap = {}; // 缓存正在现在的文件名，防止某些文件还没下载完成，又下载同一文件名的文件

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
      autoHideMenuBar: true,
      show: false // 初始化的时候不显示
    });
    this.window.on('close', this._onWindowClose.bind(this));
    this.window.loadURL(`file://${path.join(__dirname, '/fe/download/index.html')}`);
    this.webContents = this.window.webContents;
    if (packageJson.env === 'dev' || packageJson.env === 'debug'){
      this.webContents.openDevTools();
    }
  }

  open () {
    if (this.window) {
      this.window.show();
    }
  }

  isFileExist (fileName) {
    const p = path.join(DownloadPath, fileName);
    return FileUtil.isExist(p) || DownloadFileNameMap[fileName];
  }

  generateDownloadFileName (fileName) {
    let isExist = this.isFileExist(fileName);
    if (!isExist) return fileName;
    const extname = path.extname(fileName);
    const basename = path.basename(fileName, extname);
    
    let count = 0;
    
    while (isExist) {
      isExist = this.isFileExist(`${basename}(${++count})${extname}`);
    }
    return `${basename}(${count})${extname}`;
  }

  startDownload (item) {
    const fileName = this.generateDownloadFileName(item.getFilename());
    // 下载项先暂时默认保存到下载路径里，后面需要增加用户修改默认保存路径的功能
    item.setSavePath(path.join(DownloadPath, fileName));
    item.id = ++downloadIdCount;
    item.fileName = fileName;
    DownloadItemIdMap[item.id] = item;
    DownloadFileNameMap[fileName] = true;
    this.open();
    this.webContents.send(EVENTS.Start, {
      savePath: item.getSavePath(),
      itemId: item.id,
      originUrl: item.getURL(),
      mimeType: item.getMimeType(),
      hasUserGesture: item.hasUserGesture(),
      fileName: fileName,
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
      delete DownloadFileNameMap[item.fileName];
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