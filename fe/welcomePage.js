const $                 = require('jquery');
const electron          = require('electron');
const CommonView        = require('./utils/view');
const Url               = require('url');
const welcomePageTemplate = require('./hbs/welcomePage.hbs');
const preference = electron.remote.require('./preference');
const util = electron.remote.require('./native/util');

const mainBroswerWindow   = electron.remote.BrowserWindow.fromId(1);
const db = mainBroswerWindow.mainDb;
const dialog = electron.remote.dialog;
const currentWindow = electron.remote.getCurrentWindow();

const DefaultConfig = {
  onOpenUrl: function() {},
};

class View extends CommonView {
  constructor (options) {
    super({
      className: 'welcome-page hide',
      events: {
        'click .login-btn': 'onLoginClick',
        'click .sign-btn': 'onSignClick',
      }
    });
    this.settings = Object.assign({}, DefaultConfig, options);
    this.render();
  }

  hide () {
    this.$el.addClass('hide');
  }

  show () {
    this.$el.removeClass('hide');
  }

  render () {
    this.html(welcomePageTemplate());
  }

  async getUrl () {
    const config = await db.getServerConfig();
    let server;
    if (config.enablePrivate) {
      server = config.privateUrl;
    } else {
      server = config.officelUrl;
    }
    // if (!server) return;
    // const result = await util.testServer(server);
    // return server;
    return server;
  }

  async getLoginUrl () {
    const baseUrl = await this.getUrl();
    if (!baseUrl) return;
    return Url.resolve(baseUrl, '/account/login');
  }

  async getSignUrl () {
    const baseUrl = await this.getUrl();
    if (!baseUrl) return;
    return Url.resolve(baseUrl, '/account/register');
  }

  async openUrl(type) {
    let url;
    if (type === 'login') {
      url = await this.getLoginUrl();
    } else {
      url = await this.getSignUrl();
    }
    if (url) {
      const result = await util.testServer(url);
      if (result.alive) {
        this.hide();
        this.settings.onOpenUrl(url);
      } else {
        util.showNetworkErrorDialog(result.message);
      }
    } else {
      util.showNetworkErrorDialog('自定义服务器不可用');
    }
  }

  onLoginClick () {
    this.openUrl('login')
  }

  onSignClick () {
    this.openUrl('sign')
  }
}

module.exports = View;
