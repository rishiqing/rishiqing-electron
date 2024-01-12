import Store from 'electron-store'
import log from 'electron-log/main'
import os from 'node:os'
import { app } from 'electron'
import { StoreFileType } from '../../types'

const platform = os.platform()
const release = os.release()

function getDefaultDownloadPath() {
  let downloadPath = ''
  try {
    downloadPath = app.getPath('downloads')
  } catch (e) {
    // 无法获取默认的下载路径
  }
  return downloadPath
}

const store = new Store({
  name: 'setting',
  defaults: {
    windowSize: {
      width: 1218,
      height: 630,
    },
    serverConfig: {
      enablePrivate: false,
      privateUrl: '',
      privateBaseUrl: '',
      officialUrl: 'https://www.rishiqing.com',
      officialBaseUrl: '/app',
    },
    disableHardwareAcceleration:
      platform === 'win32' && release.startsWith('6.1'), // win 7 关闭硬件加速

    hotkey: {
      darwin: {
        toggle: 'Command+Option+X',
      },
      win32: {
        toggle: 'Ctrl+Alt+X',
      },
    },
    clearOldStartConfig: false, // 是否清理过旧的自启动配置，用在windows系统

    proxyConfig: {
      mold: 'none',
      host: '',
      port: '',
      username: '',
      password: '',
    },

    downloadConfig: {
      downloadPath: getDefaultDownloadPath(),
      inquiryDownloadPath: false,
    },
  },
})
log.info('store initialize')
export default store

const downloadData = new Store({
  name: 'download',
  defaults: {
    list: [] as StoreFileType[],
  },
})
log.info('download store initialize')
export { downloadData }
