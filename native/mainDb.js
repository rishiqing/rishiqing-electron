const Db        = require('./db');
const {app}     = require('electron');
const path      = require('path');
const pkg       = require('../package.json');
const { EventEmitter } = require('events');
const env       = require('../common/env');

const ServerConfigOfficiel = {
  beta: 'https://beta.rishiqing.com',
  release: 'https://www.rishiqing.com'
};

const HotKey = {
  mac: {
    active: 'Command+Option+X',
    hide: 'Command+H'
  },
  win: {
    active: 'Ctrl+Alt+X',
    hide: 'Ctrl+Alt+S'
  }
}

// 配置数据的版本号，记录一个版本号，如果以后需要重新调整配置数据的格式
// 可以通过版本号来区别处理
const VERSION = {
  server: 1,
  windowSize: 1,
  proxy: 1,
  download: 1,
  hotkey: 1
}

// 重新格式化一下server-config的配置数据
async function reformatServerConfig(db) {
  const config = await db.db.findOne({ type: 'server-config' }) || {};
  // 如果配置文件里没有版本号，则说明是之前的，需要重新插入最新的数据
  if (!config.version && config['server-type']) {
    const obj = {
      enablePrivate: false,
      privateUrl: config['custom-server-name']
    }
    // 如果是自定义的服务器
    if (config['server-type'] === 'custom') {
      obj.enablePrivate = true;
    }
    db.updateServerConfig(obj);
  }
}

async function getDefaultDownloadPath() {
  let downloadPath = ''
  try {
    downloadPath = app.getPath('downloads');
  } catch(e) {
    // 无法获取默认的下载路径
  }
  return downloadPath;
}

class MainDb {
  get EVENTS() {
    return {
      ProxyConfigChange: 'proxy-config-change',
      DownloadConfigChange: 'download-config-change',
      HotkeyConfigChange: 'hotkey-config-change',
    };
  }
  constructor () {
    this.db = new Db(path.join(app.getPath('userData'), 'nedb-main.json'));
    reformatServerConfig(this)
    this.event = new EventEmitter();
  }

  async getServerConfig () {
    const config = await this.db.findOne({ type: 'server-config' }) || {};
    return Object.assign({
      officelUrl: ServerConfigOfficiel[pkg.env], // 官网的路径
      enablePrivate: false,
      privateUrl: '',
    }, {
      enablePrivate: config.enablePrivate,
      privateUrl: config.privateUrl,
    });
  }

  async getWindowSize () {
    const config = await this.db.findOne({ type: 'main-window-size' });
    return Object.assign({
      width: pkg.MIN_WINDOW_WIDTH,
      height: pkg.MIN_WINDOW_HEIGHT,
    }, config);
  }

  // 获取网络代理的配置
  async getProxyConfig () {
    const config = await this.db.findOne({ type: 'proxy-config' }) || {};
    return Object.assign({
      mold: 'none'
    }, config)
  }

  async getDownloadConfig () {
    const config = await this.db.findOne({ type: 'download-config' });
    return Object.assign({
      downloadPath: await getDefaultDownloadPath(),
      inquiryDownloadPath: false
    }, config)
  }

  async getHotKeyConfig () {
    const config = await this.db.findOne({ type: 'hotkey-config' });
    return Object.assign({}, HotKey[env.platform], config)
  }

  updateWindowSize (data) { // { width, height } 
    this.db.update({ type: 'main-window-size' }, { $set: Object.assign({ version: VERSION.windowSize }, data) }, { upsert: true });
  }

  updateServerConfig (data) {
    this.db.update({ type: 'server-config' }, { $set: Object.assign({ version: VERSION.server }, data) }, { upsert: true });
  }

  updateProxyConfig (data) {
    this.db.update({ type: 'proxy-config' }, { $set: Object.assign({ version: VERSION.proxy }, data) }, { upsert: true });
    this.event.emit(this.EVENTS.ProxyConfigChange)
  }

  updateDownloadConfig(data) {
    this.db.update({ type: 'download-config' }, { $set: Object.assign({ version: VERSION.download }, data) }, { upsert: true });
    this.event.emit(this.EVENTS.DownloadConfigChange)
  }

  updateHotkeyConfig(data) {
    this.db.update({ type: 'hotkey-config' }, { $set: Object.assign({ version: VERSION.hotkey }, data) }, { upsert: true });
    this.event.emit(this.EVENTS.HotkeyConfigChange);
  }

  // 恢复默认数据
  restore() {
    const typeList = [
      'proxy-config',
      'server-config',
      'download-config',
      'hotkey-config'
    ]

    typeList.forEach((type) => {
      this.db.remove({ type }, { multi: true })
    });

    this.event.emit(this.EVENTS.ProxyConfigChange);
    this.event.emit(this.EVENTS.DownloadConfigChange);
    this.event.emit(this.EVENTS.HotkeyConfigChange);
  }
}

module.exports = new MainDb();