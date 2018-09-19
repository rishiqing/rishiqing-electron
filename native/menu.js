const electron      = require('electron');
const download      = require('../download');
const Menu          = electron.Menu;
const shell         = electron.shell;
const app           = electron.app;
const session       = electron.session;
const dialog        = electron.dialog;
const Notification  = electron.Notification;

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
        label: "清除缓存",
        click: function () {
          dialog.showMessageBox({
            type: 'warning',
            buttons: ['确定', '取消'],
            defaultId: 0,
            title: '确认清除缓存?',
            message: '清除缓存可能导致您退出日事清账号,需要重启后生效'
          }, function(response) {
            if (response === 1) return;
            if (response === 0) {
              // 只清除cookies，会清除用户的登录状态
              session.defaultSession.clearStorageData({
                storages: ['cookies'] // 清理 cookie
              })
              // 清除网络缓存文件
              session.defaultSession.clearCache(function() {
                const notify = new Notification({
                  title: '缓存已清理',
                  body: '需要重启软件后生效'
                });
                notify.show();
              })
            }
          })
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
