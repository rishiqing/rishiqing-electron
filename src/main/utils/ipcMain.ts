import url from 'node:url'
import { dialog, net, ipcMain, shell, app,type BrowserWindow} from 'electron'
import log from 'electron-log/main'
import store from './store'

export enum TestServerMessage {
  'close' = 'net::ERR_CONNECTION_CLOSED',
  'refused' = 'net::ERR_CONNECTION_REFUSED',
  'no-supported' = 'net::ERR_NO_SUPPORTED_PROXIES',
  'failed' = 'net::ERR_PROXY_CONNECTION_FAILED',
  'disconnected' = 'net::ERR_INTERNET_DISCONNECTED',
}

export const TestServerMessageValue = {
  [TestServerMessage.close]: '服务器拒绝访问, 请检查自定义服务器配置',
  [TestServerMessage.refused]: '服务器拒绝访问, 请检查自定义服务器配置',
  [TestServerMessage['no-supported']]: '代理服务器不可用',
  [TestServerMessage.failed]: '代理连接失败',
  [TestServerMessage.disconnected]: '无网络可用',
}

export const registerIpcMain = (mainWindow: BrowserWindow) => {
  ipcMain.on('open-log-directory', () => {
    const logDirectory = log.transports.file.getFile()
    shell.showItemInFolder(logDirectory.path)
  })

  ipcMain.handle('get-store-value', (_, key) => store.get(key))

  ipcMain.handle(
    'test-server',
    (_, server) =>
      new Promise((resolve) => {
        const testUrl = url.resolve(server, '/task/login/authAjax')
        const request = net.request(testUrl)
        let isTimeout = false
        const timer = setTimeout(() => {
          isTimeout = true
          request.abort()
          resolve({
            alive: false,
            message: '连接超时，请检查网络',
          })
          log.error(`test-server: ${server} 连接超时`)
        }, 20000)
        request.on('response', (response) => {
          let data: object
          response.on('data', (chunk) => {
            try {
              data = JSON.parse(chunk.toString())
            } catch (e) {
              log.error(`test-server: ${server} ${e}`)
            }
          })
          response.on('end', () => {
            clearTimeout(timer)
            if (isTimeout) return
            if (typeof data === 'object') {
              resolve({
                alive: true,
              })
            } else {
              resolve({
                alive: false,
                message: '自定义服务器不可用',
              })
              log.warn(`test-server: ${server} ${data}`)
            }
          })
        })
        request.on('error', (err) => {
          clearTimeout(timer)
          if (isTimeout) return
          resolve({
            alive: false,
            message:
              TestServerMessageValue[err.message as TestServerMessage] ||
              '连接出错',
          })
          log.error(`test-server: ${server} ${err.message}`)
        })
        request.end()
      }),
  )

  ipcMain.on('show-network-error', async (_, message: string) => {
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
      // preference.open()
    }
  })


  ipcMain.handle('get-app-path', () => app.getAppPath()
  )
}
