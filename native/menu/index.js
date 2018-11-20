const electron      = require('electron');
const Tray          = require('./tray');
const env           = require('../../common/env');
const mainDb        = require('../mainDb');
const MacTemplate   = require('./macTemplate');
const WinTemplate   = require('./winTemplate');
const Menu          = electron.Menu;

async function buildTemplate(template) {
  // 哪些是可以通过执行函数来获取的字段
  const canGetFromFunction = {
    accelerator: true
  };
  async function buildMenuList(menuList) {
    const t = [];
    for (let item of menuList) {
      const result = await buildItem(item);
      t.push(result);
    }
    return t;
  }
  async function buildItem(item) {
    const tmp = {};
    const keys = Object.keys(item);
    for (let key of keys) {
      if (canGetFromFunction[key] && typeof item[key] === 'function') {
        tmp[key] = await item[key]();
      } else {
        tmp[key] = item[key];
      }
    }
    if (tmp.submenu && tmp.submenu.length > 0) {
      tmp.submenu = await buildMenuList(tmp.submenu);
    }
    return tmp;
  }
  const result = await buildMenuList(template);
  return result;
}

class MenuClass {
  constructor (mainWindow) {
    this.mainWindow = mainWindow;
    this.init();
    mainDb.event.on(mainDb.EVENTS.HotkeyConfigChange, async () => {
      await this.buildMac();
      await this.buildWin();
    })
  }

  async init() {
    await this.buildTray();
    await this.buildMac();
    await this.buildWin();
  }

  // 构建托盘
  async buildTray() {
    this.tray = new Tray(this.mainWindow);
  }

  async buildMac() {
    if (env.platform !== 'mac') return;
    const template = await buildTemplate(MacTemplate);
    const m = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(m);
  }

  async buildWin() {
    if (env.platform !== 'win') return;
    const template = await buildTemplate(WinTemplate);
    const m = Menu.buildFromTemplate(template);
    this.tray.setContextMenu(m);
  }
}
module.exports = MenuClass;
