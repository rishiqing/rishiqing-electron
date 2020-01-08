const {
  shell,
  app,
} = require('electron');
const preference = require('../../preference');
const download = require('../../download');
const mainDb = require('../mainDb');

const MacTemplate = [
  {
    label: 'rishiqing',
    submenu: [
      {
        label:"日事清官网",
        click: function() { shell.openExternal('https://www.rishiqing.com') }
      },
      {
        type: 'separator',
      },
      {
        label: "偏好设置",
        accelerator: 'Command+,',
        click: function () {
          preference.open();
        }
      },
      {
        label: "下载管理",
        accelerator: 'Command+d',
        click: function () {
          download.open();
        }
      },
      {
        type: 'separator',
      },
      {
        label: "隐藏 日事清",
        accelerator: async function() {
          const config = await mainDb.getHotKeyConfig();
          if (config.hide) return config.hide;
          else return 'Command+H';
        },
        role: 'hide',
      },
      {
        label: '隐藏其他应用',
        role: 'hideOthers',
      },
      {
        type: 'separator'
      },
      {
        label: '退出',
        accelerator: 'Command+Q',
        click: function() { app.quit(); }
      },
    ]
  },
  {
    label: '编辑',
    submenu: [
      {
        label: '撤销',
        accelerator: 'Command+Z',
        selector: 'undo:'
      },
      {
        label: '重做',
        accelerator: 'Shift+Command+Z',
        selector: 'redo:'
      },
      {
        type: 'separator'
      },
      {
        label: '剪切',
        accelerator: 'Command+X',
        selector: 'cut:'
      },
      {
        label: '复制',
        accelerator: 'Command+C',
        selector: 'copy:'
      },
      {
        label: '粘贴',
        accelerator: 'Command+V',
        selector: 'paste:'
      },
      {
        label: '全选',
        accelerator: 'Command+A',
        selector: 'selectAll:'
      },{
        label: '回到日事清',
        accelerator: 'Command+B',
        click:function () {mainDb.event.emit(mainDb.EVENTS.ContentBack)}
      }
    ]
  },
  {
    label: '窗口',
    submenu: [
      {
        label: '最小化',
        role: 'minimize'
      },
      {
        label: '关闭窗口',
        accelerator: 'Command+W',
        role: 'close'
      }
    ]
  }
];

module.exports = MacTemplate;
