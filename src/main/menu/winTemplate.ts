import { app, dialog, type MenuItemConstructorOptions } from 'electron'
import { eventEmitter } from '../utils/eventEmitter'
import { ViewEvent } from '../utils/eventMessage'
import { hideWindow, showWindow } from '../utils/helper'
import preference from '../preference'
import download from '../download'
import { version } from '../../../package.json'

const list: MenuItemConstructorOptions[] = [
  { label: 'Item2', type: 'separator' },
  {
    label: '偏好设置',
    type: 'normal',
    click: () => {
      preference.open()
    },
  },
  { label: 'Item2', type: 'separator' },
  {
    label: '下载管理',
    click: () => {
      download.open()
    },
  },
  { label: 'Item2', type: 'separator' },
  {
    label: '显示主窗口',
    type: 'normal',
    click: () => {
      showWindow()
    },
  },
  { label: 'Item2', type: 'separator' },
  {
    label: '隐藏窗口',
    click: () => {
      hideWindow()
    },
  },
  { label: 'Item2', type: 'separator' },
  {
    label: '回到 首页',
    type: 'normal',
    click: () => {
      eventEmitter.emit(ViewEvent.contentBack)
    },
  },
  {
    label: '开发者工具',
    click: () => {
      eventEmitter.emit(ViewEvent.openDevTools)
    },
  },
  {
    label: '关于',
    click: () => {
      dialog.showMessageBox({
        type: 'info',
        message: version,
        title: '关于',
      })
    },
  },
  { label: 'Item2', type: 'separator' },
  {
    label: '退出',
    type: 'normal',
    click: () => {
      eventEmitter.emit(ViewEvent.setForceClose, true)
      app.quit()
    },
  },
]

export default list
