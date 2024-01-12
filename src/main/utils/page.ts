import { BrowserWindow } from 'electron'

class Page {
  get config() {
    return {}
  }
  get loadURL() {
    return ''
  }

  window: BrowserWindow | null = null
  initWindow() {
    const currentWindow = new BrowserWindow({
      ...{
        title: '窗口名字',
        width: 380,
        height: 440,
        resizable: false,
        maximizable: false,
        minimizable: false,
        autoHideMenuBar: true,
        webPreferences: {
          nodeIntegration: true,
          nodeIntegrationInWorker: true,
          nodeIntegrationInSubFrames: true,
          contextIsolation: false,
          webSecurity: false,
        },
        show: false,
      },
      ...this.config,
    })
    this.window = currentWindow
    currentWindow.on('close', (e) => {
      currentWindow.hide()
      e.preventDefault()
    })
    currentWindow.loadURL(this.loadURL)
  }

  open() {
    if (this.window) {
      this.window.show()
    }
  }
}

export default Page
