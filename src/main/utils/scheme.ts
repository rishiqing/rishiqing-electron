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
    protocol.handle('app', (request) => {
      let pathName = new URL(request.url).pathname
      let extension = path.extname(pathName).toLowerCase()

      // 默认的请求到index.html
      if (extension == '') {
        pathName = 'index.html'
        extension = '.html'
      }
      const tarFile = path.join(__dirname, pathName)
      return new Response(fs.readFileSync(tarFile), {
        headers: {
          'content-type': this.getMimeType(extension),
        },
        status: 200,
      })
    })
  }
}
