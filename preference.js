const Page = require('./page');
const path = require('path');

class Preference extends Page {
  get config () {
    return {
      title: '偏好设置',
      width: 560,
      height: 680,
    };
  }
  get loadURL () {
    return `file://${path.join(__dirname, '/fe/preference/index.html')}`;
  }

  _canOpenDevTools() {
    return true;
  }
}

module.exports = new Preference();