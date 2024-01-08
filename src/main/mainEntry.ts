import os from 'node:os'
import { app, BrowserWindow, nativeImage, shell, ipcMain } from 'electron'
import { CustomScheme } from './scheme'
import log from 'electron-log/main'
import store from './store'
import { version } from '../../package.json'
import { throttle } from 'lodash-es'

log.initialize()

// 默认5mb
log.transports.file.maxSize = 1024 * 1024 * 5

log.info('log start')

const windowSize = store.get('windowSize')

// 根路径是dist

let mainWindow: BrowserWindow

app.whenReady().then(() => {
  const platform = os.platform()
  const release = os.release()

  if (platform === 'win32' && release.startsWith('6.1')) {
    // win 7 关闭硬件加速
    app.disableHardwareAcceleration()
  }

  const config = {
    minWidth: 1218,
    minHeight: 630,
    width: windowSize.width,
    height: windowSize.height,
    title: '日事清',
    enableLargerThanScreen: true,
    webPreferences: {
      plugins: true,
      webviewTag: true,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      nodeIntegrationInSubFrames: true,
      webSecurity: false,
      enableRemoteModule: true,
      contextIsolation: false,
      minimumFontSize: 12,
      allowRunningInsecureContent: true,
      spellcheck: false,
      disableHtmlFullscreenWindowResize: true,
    },
    frame: true,
    backgroundColor: '#ffffff',
    icon: nativeImage.createFromPath(__dirname + '/resources/rishiqing.png'),
  }

  mainWindow = new BrowserWindow(config)

  const webContents = mainWindow.webContents

  // ua
  const userAgent = webContents.userAgent + ' rishiqing-pc/' + version
  webContents.userAgent = userAgent




  // 记录窗口大小
  mainWindow.on('resize', throttle(() => {
    const { width, height } = mainWindow.getBounds()
    store.set('windowSize', {
      width,
      height,
    })
  }, 200))

  mainWindow.webContents.openDevTools({ mode: 'undocked' })

  

  if (process.argv[2]) {
    mainWindow.loadURL(process.argv[2])
  } else {
    CustomScheme.registerScheme()
    mainWindow.loadURL(`app://rishiqing`)
  }
})

ipcMain.on('open-log-directory', () => {
  const logDirectory = log.transports.file.getFile()
  shell.showItemInFolder(logDirectory.path)
})
