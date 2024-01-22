import { app, BrowserWindow, nativeImage } from 'electron'
import { CustomScheme } from './utils/scheme'
import log from 'electron-log/main'
import store from './utils/store'
import { version } from '../../package.json'
import { throttle } from 'lodash-es'
import { registerIpcMain } from './utils/ipcMain'
import { createMenu } from './menu'
import { eventEmitter, forceClose } from './utils/eventEmitter'
import { ViewEvent } from './utils/eventMessage'
import { showWindow } from './utils/helper'
import { intiHotkey } from './utils/hotkey'
import { initProxy } from './utils/proxy'
import setAutoUpdate from './utils/update'
import preference from './preference'
import download from './download'

// 根路径是dist

let mainWindow: BrowserWindow

const viewInit = () => {
  log.initialize()

  // 默认5mb
  log.transports.file.maxSize = 1024 * 1024 * 5

  log.info('log start')

  const windowSize = store.get('windowSize')

  if (process.platform !== 'darwin')
    app.setAppUserModelId('release.rishiqing.electron')

  const disableHardwareAcceleration = store.get('disableHardwareAcceleration')
  if (disableHardwareAcceleration) {
    // win 7 关闭硬件加速
    app.disableHardwareAcceleration()
    log.info('disableHardwareAcceleration')
  }

  app.whenReady().then(() => {
    log.info('app ready')

    // 初始化快捷键
    intiHotkey()
    // 初始化代理
    initProxy()

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
      icon: nativeImage.createFromPath(
        __dirname + '/resources/img/rishiqing_win.png',
      ),
    }

    mainWindow = new BrowserWindow(config)

    const webContents = mainWindow.webContents

    // ua
    const userAgent = webContents.userAgent + ' rishiqing-pc/' + version
    webContents.userAgent = userAgent

    // 记录窗口大小
    mainWindow.on(
      'resize',
      throttle(() => {
        const { width, height } = mainWindow.getBounds()
        store.set('windowSize', {
          width,
          height,
        })
      }, 200),
    )

    //假关闭，点击关闭按钮隐藏弹窗
    mainWindow.on('close', (event) => {
      if (!forceClose) {
        if (process.platform === 'darwin') {
          if (mainWindow.isFullScreen()) {
            mainWindow.setFullScreen(false) // 如果是全屏状态，先退出全屏
          } else {
            app.hide()
          }
        } else {
          mainWindow.hide()
        }
        event.preventDefault()
      }
    })

    // 注册ipc
    registerIpcMain(mainWindow)

    if (process.argv[2]) {
      mainWindow.loadURL(process.argv[2])
    } else {
      CustomScheme.registerScheme()
      mainWindow.loadURL(`app://welcome`)
    }
    // 初始化下载页
    download.initWindow()
    // 初始化配置也
    preference.initWindow()
    // 检查更新
    setAutoUpdate()
    // 创建菜单
    createMenu()

    // 打开开发者工具
    eventEmitter.on(ViewEvent.openDevTools, () => {
      mainWindow.webContents.openDevTools()
    })

    // 回到首页
    eventEmitter.on(ViewEvent.contentBack, () => {
      if (process.argv[2]) {
        mainWindow.loadURL(process.argv[2])
      } else {
        mainWindow.loadURL(`app://welcome`)
      }
    })

    webContents.session.on('will-download', (_, item) => {
      download.startDownload(item)
    })

    webContents.on('render-process-gone', (_, { reason, exitCode }) => {
      log.error(`render-process-gone reason:${reason} exitCode:${exitCode}`)
    })

    webContents.on('unresponsive', () => {
      log.error('unresponsive')
    })

    webContents.on('console-message', (_, level, message) => {
      if (level <= 1) {
        log.info(`console-message ${message}`)
      }
      if (level === 2) {
        log.warn(`console-message ${message}`)
      }
      if (level === 3) {
        log.error(`console-message ${message}`)
      }
    })
  })

  app.on('window-all-closed', app.quit)

  app.on('before-quit', () => app.exit(0))

  app.on('browser-window-focus',() => {
    eventEmitter.emit(ViewEvent.clientFocus, true)
  })
  app.on('browser-window-blur',() => {
    eventEmitter.emit(ViewEvent.clientFocus, false)
  })
}

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    showWindow()
  })

  viewInit()
}
export { mainWindow }
