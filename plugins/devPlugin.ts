import { ViteDevServer } from 'vite'
import { spawn } from 'child_process'
import esbuild from 'esbuild'
import electron from 'electron'
import fsExtra from 'fs-extra'
import { preparePackageJson } from './utils'

global.__electronProcess = global.__electronProcess
  ? global.__electronProcess
  : null
export function devPlugin() {
  return {
    name: 'dev-plugin',
    async configureServer(server: ViteDevServer) {
      esbuild.buildSync({
        entryPoints: ['./src/main/mainEntry.ts'],
        bundle: true,
        platform: 'node',
        outfile: './dist/mainEntry.js',
        external: ['electron'],
      })

      fsExtra.copySync('./resources', './dist/resources')
      preparePackageJson()

      const httpServer = server.httpServer
      if (httpServer) {
        httpServer.once('listening', async () => {
          if (global.__electronProcess) {
            global.__electronProcess.kill('SIGKILL')
            global.__electronProcess = null
          }
          const addressInfo = httpServer.address()!
          const httpAddress =
            typeof addressInfo === 'string'
              ? addressInfo
              : `http://localhost:${addressInfo.port}`

          global.__electronProcess = spawn(
            String(electron),
            // 这里指定了dist目录作为启动环境
            ['./dist/mainEntry.js', httpAddress + '/welcome/'],
            {
              cwd: process.cwd(),
              stdio: 'inherit',
            },
          )
          global.__electronProcess.on('exit', (_, signal) => {
            if (!signal) {
              server.close()
              process.exit()
            }
          })
        })
      }
    },
  }
}

export function getReplacer() {
  const externalModels = [
    'os',
    'fs',
    'path',
    'events',
    'child_process',
    'crypto',
    'http',
    'buffer',
    'url',
    'better-sqlite3',
    'knex',
    'url'
  ]
  const result = {}
  for (const item of externalModels) {
    result[item] = () => ({
      find: new RegExp(`^${item}$`),
      code: `const ${item} = require('${item}');export { ${item} as default }`,
    })
  }
  result['electron'] = () => {
    const electronModules = [
      'clipboard',
      'ipcRenderer',
      'nativeImage',
      'shell',
      'webFrame',
    ].join(',')
    return {
      find: new RegExp(`^electron$`),
      code: `const {${electronModules}} = require('electron');export {${electronModules}}`,
    }
  }
  return result
}
