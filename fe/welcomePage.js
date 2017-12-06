const $                 = require('jquery');
const electron          = require('electron');
const CommonView        = require('./utils/view');
const ServerSettingView = require('./serverSetting');
const welcomePageTemplate = require('./hbs/welcomePage.hbs');

const mainBroswerWindow   = electron.remote.BrowserWindow.fromId(1);
const db = mainBroswerWindow.mainDb;

const DefaultConfig = {
  onLogin: function () {},
  onSign: function () {}
};

class View extends CommonView {
  constructor (options) {
    super({
      className: 'welcome-page hide',
      events: {
        'click .login-btn': 'onLoginClick',
        'click .sign-btn': 'onSignClick'
      }
    });
    this.settings = Object.assign({}, DefaultConfig, options);
    this.render();
    this.initConfig();
  }

  hide () {
    this.$el.addClass('hide');
  }

  show () {
    this.$el.removeClass('hide');
  }

  render () {
    this.html(welcomePageTemplate());
    this.$settingBtn = this.$('.setting-btn');
  }

  initConfig () {
    db.findOne({ type: 'server-config' }, (err, _config) => {
      const obj = _config || {};
      this.config = {
        'custom-server-name': obj['custom-server-name'] || '',
        'officiel-server-name': 'https://www.rishiqing.com',
        'server-type': (function () {
          const type = obj['server-type'];
          if (type !== 'custom') {
            return 'officiel';
          }
          return 'custom';
        })()
      };
      this.initModal();
    });
  }

  initModal () {
    this.$settingBtn.modal({
      content: () => {
        const view = new ServerSettingView(this.config, {
          onSave: this.onSave.bind(this)
        });
        return view.$el;
      }
    });
  }

  getUrl () {
    if (!this.config) return;
    const type = this.config['server-type'] === 'custom' ? 'custom' : 'officiel';
    if (type === 'officiel') {
      return this.config['officiel-server-name'];
    } else {
      return this.config['custom-server-name'];
    }
  }

  getLoginUrl () {
    const baseUrl = this.getUrl();
    if (!baseUrl) return;
    return baseUrl + '/i?port=2';
  }

  getSignUrl () {
    const baseUrl = this.getUrl();
    if (!baseUrl) return;
    return baseUrl + '/i?port=1';
  }

  onSave (_cfg) {
    this.config = _cfg;
    db.update({ type: 'server-config' }, { $set: this.config }, { upsert: true });
    this.$settingBtn.modal('hide'); 
  }

  onLoginClick () {
    if (!this.config) return;
    this.hide();
    const url = this.getLoginUrl();
    if (url) {
      this.settings.onLogin(url);
    }
  }

  onSignClick () {
    if (!this.config) return;
    this.hide();
    const url = this.getSignUrl();
    if (url) {
      this.settings.onSign(url);
    }
  }
}

module.exports = View;
