const Datastore = require('nedb');
const electron  = require('electron');
const path      = require('path');
const pkg       = require('../package.json');
const app       = electron.app;

const ServerConfigOfficiel = {
  beta: 'http://beta.rishiqing.com',
  release: 'https://www.rishiqing.com'
};

class MainDb {
  constructor () {
    this.db = new Datastore({ filename: path.join(app.getPath('userData'), 'nedb-main.json'), autoload: true });
  }

  async findOne (query) {
    return new Promise((resolve, reject) => {
      this.db.findOne(query, function (err, doc) {
        if (err) reject(err);
        else resolve(doc);
      });
    });
  }

  update (query, update, options, callback) {
    this.db.update(query, update, options, callback);
  }

  async getServerConfig () {
    const _config = await this.findOne({ type: 'server-config' });
    console.log('pkg.env', pkg.env);
    const obj = _config || {};
    const cfg = {
      'custom-server-name': obj['custom-server-name'] || '',
      'officiel-server-name': ServerConfigOfficiel[pkg.env] || ServerConfigOfficiel.release,
      'server-type': (function () {
        const type = obj['server-type'];
        if (type !== 'custom') {
          return 'officiel';
        }
        return 'custom';
      })()
    };
    return cfg;
  }

  async getWindowSize () {
    return await this.findOne({ type: 'main-window-size' }) || {};
  }

  updateWindowSize (data) { // { width, height } 
    this.update({ type: 'main-window-size' }, { $set: data }, { upsert: true });
  }

  updateServerConfig (data) {
    this.update({ type: 'server-config' }, { $set: data }, { upsert: true });
  }

}

module.exports = new MainDb();