const {
  app,
} = require('electron');
const preference = require('../../preference');
const download = require('../../download');
const mainDb = require('../mainDb');
const util = require('../util');

const WinTemplate = [
  { label: 'Item2', type: 'separator' },
  { label: '偏好设置', type: 'normal', click:() => { preference.open(); }},
  { label: 'Item2', type: 'separator' },
  { label:
    '下载管理',
    click:() => { download.open(); }
  },
  { label: 'Item2', type: 'separator' },
  { label: '显示主窗口', type: 'normal', click:() => { util.showWindow(); }},
  { label: 'Item2', type: 'separator' },
  {
    label: '隐藏窗口',
    click:() => {
      util.hideWindow();
    }
  },
  { label: 'Item2', type: 'separator' },
  {
    label: '回到日事清',
    type: 'normal',
    click:function () {mainDb.event.emit(mainDb.EVENTS.ContentBack)}
  },
  { label: 'Item2', type: 'separator' },
  { label: '退出', type: 'normal',click:() => { global.force_close = true; app.quit(); }}
];

module.exports = WinTemplate;
