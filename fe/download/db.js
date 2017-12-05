const Datastore = require('nedb');
const electron  = require('electron');
const path      = require('path');
const app       = electron.app || electron.remote.app;
const dbFile    = path.join(app.getPath('userData'), 'download-files.json');

class Db {
  constructor () {
    this.db = new Datastore({ filename: dbFile, autoload: true });
  }

  getList (callback) {
    this.db.find({}).sort({ endTime: -1 }).exec(callback);
  }

  remove (_id) {
    this.db.remove({ _id });
  }

  removeAll () {
    this.db.remove({}, { multi: true });
  }

  insert (file, callback) {
    const obj = {
      contentDisposition: file.contentDisposition,
      eTag: file.eTag,
      fileName: file.fileName,
      hasUserGesture: file.hasUserGesture,
      lastModifiedTime: file.lastModifiedTime,
      mimeType: file.mimeType,
      originUrl: file.originUrl,
      savePath: file.savePath,
      startTime: file.startTime,
      endTime: (new Date()).getTime(),
      totalBytes: file.totalBytes,
      urlChain: file.urlChain
    };
    this.db.insert(obj, callback);
  }
}

module.exports = new Db();