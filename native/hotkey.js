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
  hide: hideApp,
}

// 有部分快捷键在不同的操作系统注册不一样
const NotRegisterMap = {
  mac: {
    hide: true
  },
  win: {
    
  }
};

async function configHotkey(config) {
  if (!config || typeof config !== 'object') return;
  globalShortcut.unregisterAll();
  Object.keys(config).forEach((key) => {
    if (!HotKeyFunctionMap[key] || NotRegisterMap[env.platform][key]) return; // 如果没有对应的处理函数，则直接返回
    if (!config[key]) return;
    function registerShortcut(k) {
      globalShortcut.register(config[k], HotKeyFunctionMap[k]);
      // mac系统允许注册相同的快捷键
      const isRegistered = globalShortcut.isRegistered(config[k]);
      // 如果注册失败，自动再注册
      if (!isRegistered) {
        setTimeout(() => {
          registerShortcut(k);
        }, 2000);
      }
    }
    registerShortcut(key);
  })
}

mainDb.event.on(mainDb.EVENTS.HotkeyConfigChange, async function() {
  await configHotkey(await mainDb.getHotKeyConfig());
})

module.exports = async function hotkey() {
  const config = await mainDb.getHotKeyConfig()
  await configHotkey(config);
}