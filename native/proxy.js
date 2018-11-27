const ProxyChain = require('proxy-chain');
const portfinder = require('portfinder');
const electron = require('electron');
const mainDb = require('./mainDb');
const util = require('./util');
const url = require('url')

const {
  session,
  net,
} = electron;

portfinder.basePort = 1991;

let proxyChain;

function closeProxyChain() {
  return new Promise(function(resolve) {
    if (!proxyChain) {
      resolve();
      return;
    }
    if (proxyChain) {
      proxyChain.close(true, function() {
        resolve();
      })
    }
  })
  .then(function() {
    proxyChain = null;
  })
}

async function startProxyChain(config) {
  const port = await portfinder.getPortPromise();
  let upstreamProxyUrl
  if (config.password) {
    upstreamProxyUrl = `${config.mold}://${config.username}:${config.password}@${config.host}:${config.port}`
  } else {
    upstreamProxyUrl = `${config.mold}://${config.username}@${config.host}:${config.port}`
  }
  proxyChain = await new Promise(function(resolve) {
    const proxyServer = new ProxyChain.Server({
      port: port,
      prepareRequestFunction: () => {
        return {
          upstreamProxyUrl,
        }
      }
    });
    proxyServer.listen(function() {
      resolve(proxyServer)
    })
  })
  return port;
}

async function isServerAlive(server) {
  return await util.testServer(server);
}

// 测试代理是否可用
async function testProxy() {
  const config = await mainDb.getProxyConfig();
  if (!config.mold || config.mold === 'none') {
    return {
      alive: false,
      message: '代理配置不可用'
    }
  };
  const serverConfig = await mainDb.getServerConfig();
  let server = serverConfig.officelUrl
  if (serverConfig.enablePrivate) {
    server = serverConfig.privateUrl;
    if (!server) {
      return {
        alive: false,
        message: '你开启了私有部署, 但私有部署服务器无效'
      }
    }
  }
  const serverState = await isServerAlive(server);
  if (serverState.alive) return { alive: true };
  else return { alive: false, message: serverState.message || '代理不可用' }
}

// 关闭当前proxy
async function closeProxy() {
  await closeProxyChain();
  session.defaultSession.setProxy({
    proxyRules: 'direct://'
  }, () => {})
}

// http或者https代理
async function httpProxy(config) {
  await closeProxy();
  // 只要配置了用户名就需要开启proxyChain
  let proxyChainPort;
  if (config.username) {
    proxyChainPort = await startProxyChain(config)
  }
  if (proxyChainPort) {
    session.defaultSession.setProxy({
      proxyRules: `127.0.0.1:${proxyChainPort}`
    }, () => {})
  } else {
    session.defaultSession.setProxy({
      proxyRules: `${config.mold}://${config.host}:${config.port}`
    }, () => {})
  }
}

// socks4/socks5代理
async function socksProxy(config) {
  await closeProxy();
  session.defaultSession.setProxy({
    proxyRules: `${config.mold}://${config.host}:${config.port}`
  }, () => {})
}

async function configProxy(config) {
  if (config.mold === 'none' || !config.mold) {
    await closeProxy();
    return;
  }
  if (config.mold === 'http' || config.mold === 'https') {
    await httpProxy(config);
    return;
  }
  if (config.mold === 'socks4' || config.mold === 'socks5') {
    await socksProxy(config);
    return;
  }
  await closeProxy();
}

// 代理的配置数据有变
mainDb.event.on(mainDb.EVENTS.ProxyConfigChange, async function() {
  await configProxy(await mainDb.getProxyConfig())
})

exports.testProxy = testProxy;

exports.initProxy = async function proxy() {
  const config = await mainDb.getProxyConfig();
  await configProxy(config);
}