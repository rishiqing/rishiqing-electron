import { shell, app, type MenuItemConstructorOptions } from 'electron'
import { eventEmitter } from '../utils/eventEmitter'
import { ViewEvent } from '../utils/eventMessage'
import preference from '../preference'
import download from '../download'

const list: MenuItemConstructorOptions[] = [
  {
    label: 'rishiqing',
    submenu: [
      {
        label: '日事清官网',
        click: () => {
          shell.openExternal('https://www.rishiqing.com')
        },
      },
      {
        type: 'separator',
      },
      {
        label: '偏好设置',
        accelerator: 'Command+,',
        click: () => {
          preference.open()
        },
      },
      {
        label: '下载管理',
        accelerator: 'Command+d',
        click: () => {
          download.open()
        },
      },
      {
        type: 'separator',
      },
      {
        label: '隐藏 日事清',
        role: 'hide',
      },
      {
        label: '隐藏其他应用',
        role: 'hideOthers',
      },
      {
        type: 'separator',
      },
      {
        label: '退出',
        accelerator: 'Command+Q',
        click: () => {
          app.quit()
        },
      },
    ],
  },
  {
    label: '编辑',
    submenu: [
      {
        label: '撤销',
        accelerator: 'Command+Z',
        role: 'undo',
      },
      {
        label: '重做',
        accelerator: 'Shift+Command+Z',
        role: 'redo',
      },
      {
        type: 'separator',
      },
      {
        label: '剪切',
        accelerator: 'Command+X',
        role: 'cut',
      },
      {
        label: '复制',
        accelerator: 'Command+C',
        role: 'copy',
      },
      {
        label: '粘贴',
        accelerator: 'Command+V',
        role: 'paste',
      },
      {
        label: '全选',
        accelerator: 'Command+A',
        role: 'selectAll',
      },
      {
        label: '刷新',
        accelerator: 'Command+R',
        click: () => {
          eventEmitter.emit(ViewEvent.reload)
        },
      },
      {
        label: '回到首页',
        accelerator: 'Command+B',
        click: () => {
          eventEmitter.emit(ViewEvent.contentBack)
        },
      },
    ],
  },
  {
    label: '窗口',
    submenu: [
      {
        label: '最小化',
        role: 'minimize',
      },
      {
        label: '关闭窗口',
        accelerator: 'Command+W',
        role: 'close',
      },
      {
        label: '开发者工具',
        accelerator: 'Shift+Command+C',
        click: () => {
          eventEmitter.emit(ViewEvent.openDevTools)
        },
      },
    ],
  },
]

export default list
