const electron      = require('electron');
const path          = require('path');
const packageJson   = require('./package.json');
const EVENTS        = require('./common/download_event');
const FileUtil      = require('./utils/file');
const Page          = require('./page');
const mainDb        = require('./native/mainDb');
const ipcMain       = electron.ipcMain;
const app           = electron.app;
const dialog        = electron.dialog;

let downloadIdCount = 0;

const DownloadItemIdMap = {}; // 缓存下载对象和itemId之间的映射关系
const DownloadFileNameMap = {}; // 缓存正在现在的文件名，防止某些文件还没下载完成，又下载同一文件名的文件
let DownloadPath = ''; // 下载路径

// 获取下载路径
async function getDownloadPath() {
  const config = await mainDb.getDownloadConfig()
  if (config) {
    // 是否每次都需要询问下载路径
    if (config.inquiryDownloadPath) {
      return;
    }
    if (config.downloadPath && FileUtil.isExist(config.downloadPath)) {
      return config.downloadPath;
    }
  }
  let defaultPath = '';
  try {
    defaultPath = app.getPath('downloads')
  } catch(e) {
    // 无法获取默认的下载路径
  }

  if (defaultPath) return defaultPath;
}

// 初始化通用配置
async function initCommonConfig() {
  DownloadPath = await getDownloadPath();
  // 在保存路径发生变化的时候，重置一下
  mainDb.event.on(mainDb.EVENTS.DownloadConfigChange, async function() {
    DownloadPath = await getDownloadPath();
  })
}

initCommonConfig();

class Download extends Page {
  get config () {
    return {
      title: '下载管理'
    };
  }
  get loadURL () {
    return `file://${path.join(__dirname, '/fe/download/index.html')}`;
  }
  constructor () {
    super();
    this.initEvent();
  }
  initEvent () {
    ipcMain.on(EVENTS.Cancel_Download, this.onCancelItem.bind(this));
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
    if (!DownloadPath) return;
    if (!FileUtil.isExist(DownloadPath)) return;
    const fileName = this.generateDownloadFileName(item.getFilename());
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
}

module.exports = new Download();