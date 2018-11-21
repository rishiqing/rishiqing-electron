require('module-alias/register');
require('../alias');
require('../ui/switch');
require('../ui/switch');
require('../ui/input');
require('./proxy');
require('./server');
require('./cache');
require('./download');
require('./hotkey');
require('./restore');

const electron = require('electron');
const Vue = require('vue');

const webFrame = electron.webFrame;
const mainBroswerWindow = electron.remote.BrowserWindow.fromId(1);
const mainDb = mainBroswerWindow.mainDb;
const session = electron.remote.session.defaultSession;
const dialog = electron.remote.dialog;
const currentWindow = electron.remote.getCurrentWindow();
const autoLaunch = electron.remote.require('./native/autoLaunch');
const { testProxy } = electron.remote.require('./native/proxy');

webFrame.setZoomFactor(1);
webFrame.setVisualZoomLevelLimits(1, 1);
webFrame.setLayoutZoomLevelLimits(0, 0);

async function getCacheSize() {
  return new Promise(function(resolve) {
    session.getCacheSize(function(size) {
      resolve(size)
    });
  });
}
async function getConfig() {
  const proxyConfig = await mainDb.getProxyConfig();
  const serverConfig = await mainDb.getServerConfig();
  const cacheSize = await getCacheSize();
  const downloadConfig = await mainDb.getDownloadConfig();
  const hotkeyConfig = await mainDb.getHotKeyConfig();
  const isAutoLaunch = autoLaunch.isEnabled();
  return {
    proxyConfig,
    serverConfig,
    cacheSize,
    downloadConfig,
    hotkeyConfig,
    isAutoLaunch,
  }
}

class PreferencePage {
  constructor() {
    this.init()
  }

  async init() {
    await this.initView();
  }

  async initView() {
    const defaultConfig = await getConfig();
    const view = new Vue({
      el: '#preference',
      data: function() {
        return {
          proxyConfig: defaultConfig.proxyConfig,
          serverConfig: {
            enablePrivate: defaultConfig.serverConfig. enablePrivate,
            privateUrl: defaultConfig.serverConfig.privateUrl,
          },
          cacheSize: defaultConfig.cacheSize,
          downloadConfig: {
            inquiryDownloadPath: defaultConfig.downloadConfig.inquiryDownloadPath,
            downloadPath: defaultConfig.downloadConfig.downloadPath,
          },
          hotkeyConfig: defaultConfig.hotkeyConfig,
          isAutoLaunch: defaultConfig.isAutoLaunch,
        };
      },
      methods: {
        // 当代理配置改变的时候
        onProxyChange(config) {
          mainDb.updateProxyConfig(config)
        },
        onServerConfigChange(config) {
          mainDb.updateServerConfig({
            enablePrivate: config.enablePrivate,
            privateUrl: config.privateUrl,
          })
        },
        onCacheClearClick() {
          session.clearCache(function() {})
        },
        onDownloadChangeClick() {
          dialog.showOpenDialog({
            defaultPath: this.downloadConfig.downloadPath,
            properties: ['openDirectory', 'createDirectory']
          }, (filePaths) => {
            if (filePaths && filePaths.length) {
              this.downloadConfig.downloadPath = filePaths[0]
              mainDb.updateDownloadConfig({
                downloadPath: this.downloadConfig.downloadPath
              });
            }
          })
        },
        onInquiryChange(val) {
          mainDb.updateDownloadConfig({
            inquiryDownloadPath: val
          })
        },
        onHotkeyChange(config) {
          mainDb.updateHotkeyConfig(config)
        },
        onAutoLaunchChange(value) {
          if (value) autoLaunch.enable();
          else autoLaunch.disable();
        },
        async onRestore() {
          mainDb.restore();
          autoLaunch.disable();
          const config = await getConfig()
          this.proxyConfig = config.proxyConfig;
          this.serverConfig = {
            enablePrivate: config.serverConfig. enablePrivate,
            privateUrl: config.serverConfig.privateUrl,
          };
          this.cacheSize = config.cacheSize;
          this.downloadConfig = {
            inquiryDownloadPath: config.downloadConfig.inquiryDownloadPath,
            downloadPath: config.downloadConfig.downloadPath,
          };
          this.hotkeyConfig = config.hotkeyConfig;
          this.isAutoLaunch = config.isAutoLaunch;
        },
        async onProxyTestClick() {
          const result = await testProxy()
          dialog.showMessageBox(currentWindow, {
            type: result.alive ? 'info' : 'error',
            message: result.alive ? '代理可用' : result.message
          })
        }
      }
    })
  }
}

module.exports = new PreferencePage()