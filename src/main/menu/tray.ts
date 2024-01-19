import {
  Tray,
  Menu,
  nativeTheme,
  nativeImage,
  systemPreferences,
} from 'electron'
import path from 'node:path'
import { showWindow } from '../utils/helper'
import store from '../utils/store'
import { disableAutoStart, getAutoStartValue } from './startOnBoot'
import { autoLaunchEnable } from '../utils/autoLaunch'

export const getImage = () => {
  let tray_icon
  let size = 16
  if (process.platform === 'darwin') {
    if (nativeTheme.shouldUseDarkColors) {
      tray_icon = '/resources/img/tray_mac_dark_mode.png'
    } else {
      tray_icon = '/resources/img/tray_mac.png'
    }
  } else {
    tray_icon = '/resources/img/rishiqing_win.png'
    size = 64
  }
  return nativeImage
    .createFromPath(path.join(__dirname, tray_icon))
    .resize({ width: size, height: size })
}
export const getPressedImage = () => {
  const tray_icon_pressed = '/resources/img/tray_mac_dark_mode.png'
  return nativeImage
    .createFromPath(path.join(__dirname, tray_icon_pressed))
    .resize({ width: 16, height: 16 })
}

let currentTray: Tray | null = null

const initAppIcon = () => {
  currentTray = new Tray(getImage())
  currentTray.setToolTip('日事清')
  if (process.platform === 'darwin') {
    currentTray.setPressedImage(getPressedImage())
  }
}

const initEvent = () => {
  if (!currentTray) return
  currentTray.on('click', () => {
    showWindow()
  })
  // mac系统需要监听操作系统的主题变化
  if (process.platform === 'darwin') {
    systemPreferences.subscribeNotification(
      'AppleInterfaceThemeChangedNotification',
      () => {
        currentTray && currentTray.setImage(getImage())
      },
    )
  }
}
const clearOldStartConfig = async () => {
  if (process.platform !== 'win32') return
  const status = store.get('clearOldStartConfig')
  // 如果状态里记录的已经清理过旧的自启动配置
  // 则直接返回
  // 防止部分机子由于没有读取注册表权限的问题，而导致app崩溃
  if (status) return
  store.set('clearOldStartConfig', true)
  const old_key_1 = 'rishiqing_startOnBoot' // 之前版本保存自动启动地址的key
  const old_key_2 = 'rishiqing_V3' // 新版的自启动key
  getAutoStartValue(old_key_1, (value) => {
    if (value) {
      disableAutoStart(old_key_1)
      autoLaunchEnable()
    }
  })
  getAutoStartValue(old_key_2, (value) => {
    if (value) {
      disableAutoStart(old_key_2)
      autoLaunchEnable()
    }
  })
}

export const createTray = () => {
  initAppIcon()
  initEvent()
  setTimeout(() => {
    clearOldStartConfig()
  }, 0)
}

export const setContextMenu = (m: Menu) => {
  currentTray && currentTray.setContextMenu(m)
}
