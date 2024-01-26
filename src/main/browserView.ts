import {
  type BrowserWindow,
  BrowserView,
  app,
  Menu,
  MenuItemConstructorOptions,
} from 'electron'
import { eventEmitter } from './utils/eventEmitter'
import { ViewEvent } from './utils/eventMessage'

let view: BrowserView

export const createMainBrowserView = async (
  mainWindow: BrowserWindow,
  url: string,
) => {
  view = new BrowserView({
    webPreferences: {
      webSecurity: false,
      allowRunningInsecureContent: true,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      contextIsolation: false,
      devTools: true,
      backgroundThrottling: false,
      preload: app.getAppPath() + '/resources/common/preload.js',
      additionalArguments: ['--disable-site-isolation-trials'],
    },
  })

  view.setAutoResize({
    width: true,
  })

  // electron bug，不同平台，y坐标不同 25版本之后修复
  // https://github.com/electron/electron/pull/38981
  const getY = (newBounds: Electron.Rectangle) => {
    if (process.platform === 'darwin') {
      return newBounds.y - mainWindow.getBounds().y
    }
    return 0
  }

  mainWindow.setBrowserView(view)
  view.setBounds({
    x: 0,
    y: getY(mainWindow.getContentBounds()),
    width: mainWindow.getContentBounds().width,
    height: mainWindow.getContentSize()[1],
  })
  view.webContents.loadURL(url, {
    userAgent: mainWindow.webContents.userAgent,
  })

  view.webContents.insertCSS(`
  #r-login-register {
    user-select: none
  }
  .r-login-register__sidebar-img {
    vertical-align: bottom
  }
`)

  mainWindow.on('resize', () => {
    let newBounds = mainWindow.getContentBounds()
    view.setBounds({
      x: 0,
      y: getY(newBounds),
      width: newBounds.width,
      height: mainWindow.getContentSize()[1],
    })
  })

  const menuTpl: MenuItemConstructorOptions[] = [
    {
      label: '撤销',
      accelerator: 'CommandOrControl+Z',
      role: 'undo',
    },
    {
      label: '重做',
      accelerator: 'CommandOrControl+Y',
      role: 'redo',
    },
    {
      type: 'separator',
    },
    {
      label: '剪切',
      accelerator: 'CommandOrControl+X',
      role: 'cut',
    },
    {
      label: '复制',
      accelerator: 'CommandOrControl+C',
      role: 'copy',
    },
    {
      label: '粘贴',
      accelerator: 'CommandOrControl+V',
      role: 'paste',
    },
    {
      label: '全选',
      accelerator: 'CommandOrControl+A',
      role: 'selectAll',
    },
    {
      type: 'separator',
    },
    {
      label: '前进',
      visible: true,
      click() {
        if (view.webContents.canGoForward()) {
          view.webContents.goForward()
        }
      },
    },
    {
      label: '后退',
      visible: true,
      click() {
        if (view.webContents.canGoBack()) {
          view.webContents.goBack()
        }
      },
    },
    {
      label: '刷新',
      accelerator: 'CommandOrControl+R',
      click() {
        view.webContents.reload()
      },
    },
    {
      label: '检查',
      click() {
        view.webContents.openDevTools()
      },
    },
  ]

  view.webContents.on('context-menu', () => {
    Menu.buildFromTemplate(menuTpl).popup({
      window: mainWindow,
    })
  })

  view.webContents.on('before-input-event', (_, { key, meta }) => {
    // 其实主要兼容windows ，mac有菜单栏 里面有刷新也绑定同样快捷键
    if (process.platform === 'win32') {
      if (key === 'F5') view.webContents.reload()
    } else if (process.platform === 'darwin') {
      if (key === 'r' && meta) view.webContents.reload()
    }
  })

  view.webContents.on('ipc-message', (_, channel, message) => {
    if (channel === 'can_auto_login' && !message) {
      view.webContents.close()
      //实际上上页面不会真正的销毁，反而因为没有登录态反复刷新，重复执行preload，因此这里直接跳走
      view.webContents.loadURL('about:blank')
      mainWindow.removeBrowserView(view)
      view.webContents.closeDevTools()
    }

    if (channel === 'on_logout') {
      view.webContents.close()
      view.webContents.loadURL('about:blank')
      mainWindow.removeBrowserView(view)
      view.webContents.closeDevTools()
    }
  })

  view.setBackgroundColor('#ffffff')

  eventEmitter.on(ViewEvent.reload, () => {
    view.webContents.reload()
  })

  eventEmitter.on(ViewEvent.clientFocus, (focus) => {
    view.webContents.send('client_focus',focus)    
  })
}
