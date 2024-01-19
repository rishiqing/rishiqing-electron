import { protocol } from 'electron'
import fs from 'node:fs'
import path from 'node:path'

//为自定义的app协议提供特权
const schemeConfig = {
  standard: true,
  supportFetchAPI: true,
  bypassCSP: true,
  corsEnabled: true,
  stream: true,
}
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: schemeConfig },
])

export class CustomScheme {
  //根据文件扩展名获取mime-type
  private static getMimeType(extension: string) {
    let mimeType = ''
    if (extension === '.js') {
      mimeType = 'text/javascript'
    } else if (extension === '.html') {
      mimeType = 'text/html'
    } else if (extension === '.css') {
      mimeType = 'text/css'
    } else if (extension === '.svg') {
      mimeType = 'image/svg+xml'
    } else if (extension === '.png') {
      mimeType = 'image/png'
    } else if (extension === '.json') {
      mimeType = 'application/json'
    }
    return mimeType
  }
  //注册自定义app协议
  static registerScheme() {
    protocol.registerStreamProtocol('app', (request, callback) => {
      let { pathname, host } = new URL(request.url)
      let extension = path.extname(pathname).toLowerCase()
      // 默认的请求到index.html
      if (extension == '') {
        pathname = 'index.html'
        extension = '.html'
      }
      // 如果结尾不是html，那么没必要根据host区分
      if (extension !== '.html') host = ''
      const tarFile = path.join(__dirname, host, pathname)
      callback({
        statusCode: 200,
        headers: {
          'content-type': this.getMimeType(extension),
        },
        data: fs.createReadStream(tarFile),
      })
    })
  }
}
