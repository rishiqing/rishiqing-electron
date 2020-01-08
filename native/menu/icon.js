const {
  systemPreferences,
  nativeImage,
  nativeTheme
} = require('electron');
const { EventEmitter } = require('events');
const path = require('path');
const env = require('../../common/env');

class Icon {
  get EVENTS() {
    return {
      ThemeChange: 'theme-change'
    };
  }
  constructor() {
    this.event = new EventEmitter();
    if (env.isMac) {
      systemPreferences.subscribeNotification(
        'AppleInterfaceThemeChangedNotification',
      () => {
        this.event.emit(this.EVENTS.ThemeChange);
      });
    }
  }

  // 获取正常情况下的tray图标
  getImage() {
    let tray_icon;
    if (env.isMac) {
      if (nativeTheme.shouldUseDarkColors) {
        tray_icon = '../../res/tray_mac_drak_mode@2x.png';
      } else {
        tray_icon = '../../res/tray_mac@2x.png';
      }
    } else {
      tray_icon = '../../res/tray_win.ico';
    }
    return nativeImage.createFromPath(path.join(__dirname, tray_icon));
  }
  // 获取点击情况下的tray图标
  getPressedImage() {
    const tray_icon_pressed = '../../res/tray_mac_drak_mode@2x.png';
    return nativeImage.createFromPath(path.join(__dirname, tray_icon_pressed));
  }
  // 获取一个空白图标，用来做闪烁用
  getEmptyImage() {
    return nativeImage.createEmpty();
  }
}

module.exports = new Icon();
