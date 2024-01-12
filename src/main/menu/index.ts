import { Menu } from 'electron'
import macTemplate from './macTemplate'
import winTemplate from './winTemplate'
import { createTray, setContextMenu } from './tray'

const buildMac = async () => {
  if (process.platform !== 'darwin') return
  const m = Menu.buildFromTemplate(macTemplate)
  Menu.setApplicationMenu(m)
}

const buildWin = async () => {
  if (process.platform !== 'win32') return
  const m = Menu.buildFromTemplate(winTemplate)
  setContextMenu(m)
  Menu.setApplicationMenu(null)
}

export const createMenu = async () => {
  createTray()
  await buildMac()
  await buildWin()
}
