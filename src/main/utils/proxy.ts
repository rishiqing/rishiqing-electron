import { Server } from 'proxy-chain'
import portfinder from 'portfinder'
import { session } from 'electron'
import { eventEmitter } from './eventEmitter'
import { ViewEvent } from './eventMessage'
import store from './store'
import { proxyConfig } from '../../types'
import { testServer } from './helper'

portfinder.basePort = 1991

let proxyChain: Server | null

const closeProxyChain = () => {
  return new Promise((resolve) => {
    if (!proxyChain) {
      resolve(void 0)
      return
    }
    if (proxyChain) {
      proxyChain.close(true, () => {
        resolve(void 0)
      })
    }
  }).then(() => {
    proxyChain = null
  })
}
export const startProxyChain = async (config: proxyConfig) => {
  const port = await portfinder.getPortPromise()
  let upstreamProxyUrl: string
  if (config.password) {
    upstreamProxyUrl = `${config.mold}://${config.username}:${config.password}@${config.host}:${config.port}`
  } else {
    upstreamProxyUrl = `${config.mold}://${config.username}@${config.host}:${config.port}`
  }
  proxyChain = await new Promise((resolve) => {
    const proxyServer = new Server({
      port: port,
      prepareRequestFunction: () => {
        return {
          upstreamProxyUrl,
        }
      },
    })
    proxyServer.listen(() => {
      resolve(proxyServer)
    })
  })
  return port
}
export const isServerAlive = async (server: string) => {
  return await testServer(server)
}

// 测试代理是否可用
export const testProxy = async () => {
  const config = store.get('proxyConfig')
  if (!config.mold || config.mold === 'none') {
    return {
      alive: false,
      message: '代理配置不可用',
    }
  }
  const serverConfig = store.get('serverConfig')
  let server = serverConfig.officialUrl
  if (serverConfig.enablePrivate) {
    server = serverConfig.privateUrl
    if (!server) {
      return {
        alive: false,
        message: '你开启了私有部署, 但私有部署服务器无效',
      }
    }
  }
  const serverState = await isServerAlive(server)
  if (serverState.alive) return { alive: true }
  else return { alive: false, message: serverState.message || '代理不可用' }
}

// 关闭当前proxy
const closeProxy = async () => {
  await closeProxyChain()
  session.defaultSession.setProxy({
    proxyRules: 'direct://',
  })
}

// http或者https代理
const httpProxy = async (config: proxyConfig) => {
  await closeProxy()
  // 只要配置了用户名就需要开启proxyChain
  let proxyChainPort
  if (config.username) {
    proxyChainPort = await startProxyChain(config)
  }
  if (proxyChainPort) {
    session.defaultSession.setProxy({
      proxyRules: `127.0.0.1:${proxyChainPort}`,
    })
  } else {
    session.defaultSession.setProxy({
      proxyRules: `${config.mold}://${config.host}:${config.port}`,
    })
  }
}

// socks4/socks5代理
const socksProxy = async (config: proxyConfig) => {
  await closeProxy()
  session.defaultSession.setProxy({
    proxyRules: `${config.mold}://${config.host}:${config.port}`,
  })
}
const configProxy = async (config: proxyConfig) => {
  if (config.mold === 'none' || !config.mold) {
    await closeProxy()
    return
  }
  if (config.mold === 'http' || config.mold === 'https') {
    await httpProxy(config)
    return
  }
  if (config.mold === 'socks4' || config.mold === 'socks5') {
    await socksProxy(config)
    return
  }
  await closeProxy()
}

export const initProxy = async () => {
  const config = store.get('proxyConfig')
  await configProxy(config)
}

eventEmitter.on(ViewEvent.proxyConfigChange, async () => {
  await initProxy()
})
