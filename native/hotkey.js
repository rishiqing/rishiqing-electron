const { globalShortcut, app } = require('electron');
const mainDb = require('./mainDb');
const util = require('./util');
const env = require('../common/env');

// 激活应用
async function activeApp() {
  util.showWindow();
}

// 隐藏应用
async function hideApp() {
  util.hideWindow();
}

// 热键和方法的映射
const HotKeyFunctionMap = {
  active: activeApp,
  // hide: hideApp,
}

// 有部分快捷键在不同的操作系统注册不一样
const NotRegisterMap = {
  mac: {
    hide: true
  }
};

async function configHotkey(config) {
  if (!config || typeof config !== 'object') return;
  globalShortcut.unregisterAll();
  Object.keys(config).forEach((key) => {
    if (!HotKeyFunctionMap[key] || NotRegisterMap[env.platform][key]) return; // 如果没有对应的处理函数，则直接返回
    if (!config[key]) return;
    globalShortcut.register(config[key], HotKeyFunctionMap[key]);
  })
}

mainDb.event.on(mainDb.EVENTS.HotkeyConfigChange, async function() {
  await configHotkey(await mainDb.getHotKeyConfig());
})

module.exports = async function hotkey() {
  const config = await mainDb.getHotKeyConfig()
  await configHotkey(config);
}