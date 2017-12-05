require('module-alias/register');
require('../alias');
require('./downloadItem');
const Db           = require('./db');
const electron     = require('electron');
const Vue          = require('vue');
const downloadData = require('./data');
const FileUtil     = require('../utils/file');

const shell        = electron.shell;
const webFrame     = electron.webFrame;

webFrame.setZoomFactor(1);
webFrame.setVisualZoomLevelLimits(1, 1);
webFrame.setLayoutZoomLevelLimits(0, 0);

class DownloadPage {
  constructor () {
    const view = new Vue({
      el: '#download',
      data: {
        downloadingList: downloadData.DownloadingList,
        downloadedList: downloadData.DownloadedList
      },
      methods: {
        getFileTypeImageUrl (file) {
          const type = FileUtil.getFileSmallImage(file.fileName);
          return `../img/file/${type}_2x.png`;
        },
        openItem (file) {
          shell.openItem(file.savePath);
        },
        openInFolder (file) {
          shell.showItemInFolder(file.savePath);
        },
        cancel (file) {
          downloadData.cancelItem(file);
        },
        clear (file) {
          downloadData.clearItem(file);
        },
        clearAll () {
          downloadData.clearAll();
        }
      }
    });
  }
}

module.exports = new DownloadPage();