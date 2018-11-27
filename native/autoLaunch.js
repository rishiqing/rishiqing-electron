const { app } = require('electron');

class AutoLaunch {
  isEnabled() {
    const setting = app.getLoginItemSettings();
    return setting.openAtLogin;
  }

  enable() {
    app.setLoginItemSettings({
      openAtLogin: true,
    })
  }

  disable() {
    app.setLoginItemSettings({
      openAtLogin: false,
    })
  }
}

module.exports = new AutoLaunch();