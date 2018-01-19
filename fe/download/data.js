const electron    = require('electron');
const EVENTS      = require('../../common/download_event');
const _           = require('lodash');
const FileUtil    = require('../utils/file');
const db          = require('./db');
const ipcRenderer = electron.ipcRenderer;

const DownloadingList = []; // 用来缓存正在下载的文件列表信息
const DownloadedList = []; // 用来缓存已经下载的文件列表信息

class DownloadData {

  get DownloadingList () {
    return DownloadingList;
  }

  get DownloadedList () {
    return DownloadedList;
  }

  constructor () {
    this._initDownloadedList();
    this._initEvent();
  }

  findItemById (itemId) {
    return _.find(DownloadingList, { itemId });
  }
  removeItemById (itemId) {
    const index = _.findIndex(DownloadingList, { itemId });
    if (index > -1) DownloadingList.splice(index, 1);
  }
  removeItemInDownLoadedList (_id) {
    const index = _.findIndex(DownloadedList, { _id });
    if (index > -1) DownloadedList.splice(index, 1);
  }
  clearItem (item) {
    this.removeItemInDownLoadedList(item._id);
    db.remove(item._id);
  }
  cancelItem (item) {
    ipcRenderer.send(EVENTS.Cancel_Download, item.itemId);
    this.removeItemById(item.itemId);
  }
  clearAll () {
    DownloadedList.splice(0);
    db.removeAll();
  }

  _initDownloadedList () {
    db.getList(function (err, items) {
      items.forEach(item => DownloadedList.push(item));
    });
  }

  _initEvent () {
    ipcRenderer.on(EVENTS.Start, this._onStart.bind(this));
    ipcRenderer.on(EVENTS.Progress, this._onProgress.bind(this));
    ipcRenderer.on(EVENTS.Completed, this._onCompleted.bind(this));
  }

  _onStart (e, file) {
    file.percent = 0;
    file.completed = false;
    DownloadingList.unshift(file);
  }

  _onProgress (e, progress) {
    const file = this.findItemById(progress.itemId);
    if (file) {
      file.totalBytes = progress.totalBytes;
      file.receivedBytes = progress.receivedBytes;
      file.percent = Math.ceil(file.receivedBytes / file.totalBytes * 100);
    }
  }

  _onCompleted (e, data) {
    const file = this.findItemById(data.itemId);
    if (file) {
      file.completed = true;
      this.removeItemById(file.itemId);
      db.insert(file, function (err, newFile) {
        DownloadedList.unshift(newFile);
      });
    }
  }
}

module.exports = new DownloadData();