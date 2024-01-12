import Store from 'electron-store'
import log from 'electron-log/main'
import os from 'node:os'
import path from 'node:path'
import fs from 'node:fs'
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
const base = app.getPath('userData')

const oldSetting = path.join(base, 'nedb-main.json')

// 检查文件是否存在
if (fs.existsSync(oldSetting)) {
  log.info('store migrate')
  fs.readFile(oldSetting, 'utf8', (err, data) => {
    if (err) {
      log.error('store migrate err' + err)
    } else {
      const dataArray = data.split('\n').map((jsonString) => {
        if (!jsonString) return null
        try {
          return JSON.parse(jsonString)
        } catch (error) {
          log.error('store migrate err , parsing JSON' + error)
          return null
        }
      })
      dataArray.forEach((item) => {
        if (item) {
          if (item.type === 'hotkey-config') {
            const key = process.platform === 'darwin' ? 'darwin' : 'win32'
            store.set(`hotkey.${key}.toggle`, item.toggle)
          }
          if (item.type === 'main-window-size') {
            store.set('windowSize', {
              width: item.width,
              height: item.height,
            })
          }
          if (item.type === 'download-config') {
            const db = store.get('downloadConfig')
            store.set('downloadConfig', {
              // 旧版downloadPath有bug，实际上下载地址是无法更改的
              downloadPath: item.downloadPath || db.downloadPath,
              inquiryDownloadPath: item.inquiryDownloadPath,
            })
          }
          if (item.type === 'proxy-config') {
            store.set('proxyConfig', {
              mold: item.mold || '',
              host: item.host || '',
              port: item.port || '',
              username: item.username || '',
              password: item.password || '',
            })
          }
          if (item.type === 'server-config') {
            const db = store.get('serverConfig')
            store.set('serverConfig', {
              enablePrivate: item.enablePrivate || db.enablePrivate,
              privateUrl: item.privateUrl || db.privateUrl,
              privateBaseUrl: '/app',
              officialUrl: db.officialUrl,
              officialBaseUrl: db.officialBaseUrl,
            })
          }
        }
      })
      fs.unlink(oldSetting, (err) => {
        if (err) {
          log.info('store migrate unlink old setting error' + err)
        } else {
          log.info('store migrate successfully')
        }
      })
    }
  })
}

export default store

const downloadData = new Store({
  name: 'download',
  defaults: {
    list: [] as StoreFileType[],
  },
})
log.info('download store initialize')

const oldDownload = path.join(base, 'download-files.json')

// 检查文件是否存在
if (fs.existsSync(oldDownload)) {
  log.info('download migrate')
  fs.readFile(oldDownload, 'utf8', (err, data) => {
    if (err) {
      log.error('download migrate err' + err)
    } else {
      const dataArray = data.split('\n').map((jsonString) => {
        if (!jsonString) return null
        try {
          return JSON.parse(jsonString)
        } catch (error) {
          log.error('download migrate err , parsing JSON' + error)
          return null
        }
      })
      const res = dataArray.filter((i) => i)
      const db = downloadData.get('list')
      downloadData.set('list', [...db, ...res])
      fs.unlink(oldDownload, (err) => {
        if (err) {
          log.info('download migrate unlink old setting error' + err)
        } else {
          log.info('download migrate successfully')
        }
      })
    }
  })
}

export { downloadData }
