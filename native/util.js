const { BrowserWindow, dialog, session, net } = require('electron');
const url = require('url');
const preference = require('../preference');

const TestServerMessage = {
  'net::ERR_CONNECTION_CLOSED': '服务器拒绝访问, 请检查自定义服务器配置',
  'net::ERR_CONNECTION_REFUSED': '服务器拒绝访问, 请检查自定义服务器配置',
  'net::ERR_NO_SUPPORTED_PROXIES': '代理服务器不可用',
  'net::ERR_PROXY_CONNECTION_FAILED': '代理连接失败',
  'net::ERR_INTERNET_DISCONNECTED': '无网络可用',
}

class Util {
  get mainWindow () {
    return BrowserWindow.fromId(1);
  }

  showWindow() {
    let show = false;
    const mainWindow = this.mainWindow;
    if (!mainWindow) return show;
    if (!mainWindow.isVisible()) {
      mainWindow.show();
      mainWindow.focus();
      show = true;
    }
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
      mainWindow.focus();
      show = true;
    }
    if (!show && !mainWindow.isFocused()) {
      mainWindow.focus();
      show = true;
    }
    return show;
  }

  hideWindow() {
    const allWindows = BrowserWindow.getAllWindows();
    allWindows.forEach((win) => {
      win.close();
    });
  }

  clearCache() {
    dialog.showMessageBox({
      type: 'warning',
      buttons: ['确定', '取消'],
      defaultId: 0,
      title: '确认清除缓存?',
      message: '清除缓存可能导致您退出日事清账号,需要重启后生效'
    }, function(response) {
      if (response === 1) return;
      if (response === 0) {
        // 只清除cookies，会清除用户的登录状态
        session.defaultSession.clearStorageData({
          storages: ['cookies'] // 清理 cookie
        })
        // 清除网络缓存文件
        session.defaultSession.clearCache(function() {
          const notify = new Notification({
            title: '缓存已清理',
            body: '需要重启软件后生效'
          });
          notify.show();
        })
      }
    })
  }

  // 给定一个server链接，测试这个server是否可用
  testServer(server) {
    return new Promise(function(resolve, reject) {
      const testUrl = url.resolve(server, '/task/login/authAjax');
      const request = net.request(testUrl);
      let isTimeout = false
      const timer = setTimeout(() => {
        isTimeout = true;
        request.abort();
        resolve({
          alive: false,
          message: '连接超时，请检查网络',
        });
      }, 20000); // 10秒超时
      request.on('response', (response) => {
        let data;
        response.on('data', (chunk) => {
          try{
            data = JSON.parse(chunk.toString())
          } catch(e) {}
        })
        response.on('end', () => {
          clearTimeout(timer)
          if (isTimeout) return;
          if (typeof data === 'object') {
            resolve({
              alive: true
            })
          } else {
            resolve({
              alive: false,
              message: '自定义服务器不可用',
            })
          }
        })
      })
      request.on('error', (err) => {
        clearTimeout(timer);
        if (isTimeout) return;
        resolve({
          alive: false,
          message: TestServerMessage[err.message] || '连接出错'
        });
      })
      request.end()
    });
  }

  showNetworkErrorDialog(message) {
    dialog.showMessageBox(this.mainWindow, {
      type: 'error',
      defaultId: 0,
      cancelId: 1,
      buttons: ['打开偏好设置', '取消'],
      message: `${message}`
    }, function(result) {
      if (result === 1) return;
      if (result === 0) {
        preference.open()
      }
    })
  }
}

module.exports = new Util();