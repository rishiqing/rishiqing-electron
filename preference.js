const Page = require('./page');
const path = require('path');
const packageJson = require('./package.json')
class Preference extends Page {
  get config () {
    return {
      title: '偏好设置',
      width: 560,
      height: 680,
    };
  }
  get loadURL () {
    return packageJson.env === 'dev' ? 'http://localhost:8080/preference' : `file://${path.join(__dirname, '/dist/preference/index.html')}`;
  }

  // _canOpenDevTools() {
  //   return true;
  // }
}

module.exports = new Preference();