const electron      = require('electron');
const download      = require('../download');
const Menu          = electron.Menu;
const shell         = electron.shell;
const app           = electron.app;

const template = [
  {
    label: 'rishiqing',
    submenu: [
      {
        label:"日事清官网",
        click: function() { shell.openExternal('https://www.rishiqing.com') }
      },
      {
        label: "下载管理",
        click: function () {
          download.open();
        }
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
      }
    ]
  }
];
class MenuClass {
  constructor () {
    if (process.platform === 'darwin') {
      const m = Menu.buildFromTemplate(template);
      Menu.setApplicationMenu(m);
    }
  }
}
module.exports = MenuClass;
