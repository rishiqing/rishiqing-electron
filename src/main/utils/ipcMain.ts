import { dialog, ipcMain, shell, session, app, BrowserWindow } from 'electron'
import log from 'electron-log/main'
import store from './store'
import { IpcEvent, ViewEvent } from './eventMessage'
import { createMainBrowserView } from '../browserView'
import { testServer } from './helper'
import preference from '../preference'
import {
  autoLaunchDisable,
  autoLaunchEnable,
  autoLaunchIsEnabled,
} from './autoLaunch'
import { eventEmitter } from './eventEmitter'
import { testProxy } from './proxy'

export const registerIpcMain = (mainWindow: BrowserWindow) => {
  ipcMain.on(IpcEvent.openLogDirectory, () => {
    const logDirectory = log.transports.file.getFile()
    console.log(logDirectory.path)
    shell.showItemInFolder(logDirectory.path)
  })

  ipcMain.handle(IpcEvent.getStoreValue, (_, key) => store.get(key))

  ipcMain.handle(IpcEvent.testServer, (_, server) => testServer(server))

  ipcMain.on(IpcEvent.showNetworkError, async (_, message: string) => {
    const res = await dialog.showMessageBox(mainWindow, {
      type: 'error',
      defaultId: 0,
      cancelId: 1,
      buttons: ['打开偏好设置', '取消'],
      message: `${message}`,
    })
    if (res.response === 1) {
      return
    }
    if (res.response === 0) {
      preference.open()
    }
  })

  ipcMain.handle(IpcEvent.getAppPath, () => app.getAppPath())

  ipcMain.handle(IpcEvent.showUrl, async (_, url) => {
    await createMainBrowserView(mainWindow, url)
  })

  ipcMain.handle(IpcEvent.getSessionSize, () =>
    session.defaultSession.getCacheSize(),
  )

  ipcMain.handle(IpcEvent.getHotkey, () => {
    const key = process.platform === 'darwin' ? 'darwin' : 'win32'
    return store.get('hotkey')[key]
  })

  ipcMain.handle(IpcEvent.getAutoLaunch, () => autoLaunchIsEnabled())
  ipcMain.handle(IpcEvent.setAutoLaunch, (_, data) => {
    if (data) {
      autoLaunchEnable()
    } else {
      autoLaunchDisable()
    }
  })

  ipcMain.on(IpcEvent.hotkeyConfigChange, (_, data) => {
    const key = process.platform === 'darwin' ? 'darwin' : 'win32'
    store.set(`hotkey.${key}`, data)
    eventEmitter.emit(ViewEvent.hotkeyConfigChange)
  })

  ipcMain.on(IpcEvent.downloadConfigChange, (_, data) => {
    const db = store.get('downloadConfig')
    store.set('downloadConfig', {
      ...db,
      ...data,
    })
    eventEmitter.emit(ViewEvent.downloadConfigChange)
  })

  ipcMain.handle(IpcEvent.openDownloadDialog, (_, data) =>
    dialog.showOpenDialog({
      defaultPath: data.downloadPath,
      properties: ['openDirectory', 'createDirectory'],
    }),
  )

  ipcMain.on(IpcEvent.clearSession, () => session.defaultSession.clearCache())

  ipcMain.on(IpcEvent.proxyConfigChange, (_, data) => {
    const db = store.get('proxyConfig')
    store.set('proxyConfig', {
      ...db,
      ...data,
    })
    eventEmitter.emit(ViewEvent.proxyConfigChange)
  })

  ipcMain.on(IpcEvent.testProxy, async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)!
    const result = await testProxy()
    dialog.showMessageBox(win, {
      type: result.alive ? 'info' : 'error',
      message: result.alive ? '代理可用' : result.message || '',
    })
  })

  ipcMain.on(IpcEvent.serverConfigChange, (_, data) => {
    const db = store.get('serverConfig')
    store.set('serverConfig', {
      ...db,
      ...data,
    })
  })

  ipcMain.on(IpcEvent.setDisableHardwareAcceleration, (_, data) => {
    store.set('disableHardwareAcceleration', data)
  })

  ipcMain.handle(IpcEvent.restoreDb, () => {
    store.clear()
  })

  ipcMain.on(IpcEvent.openPath, (_,path) => {
    shell.openPath(path)
  })

  ipcMain.on(IpcEvent.openInFolder, (_,path) => {
    shell.showItemInFolder(path)
  })
}
