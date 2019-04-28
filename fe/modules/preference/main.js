import Vue        from 'vue'
import Preference from './Preference.vue'
import store      from '../../store'
import electron   from 'electron'

const webFrame = electron.webFrame
const mainBroswerWindow = electron.remote.BrowserWindow.fromId(1)
const mainDb = mainBroswerWindow.mainDb
const session = electron.remote.session.defaultSession
const autoLaunch = electron.remote.require('./native/autoLaunch')

webFrame.setZoomFactor(1)
webFrame.setVisualZoomLevelLimits(1, 1)
webFrame.setLayoutZoomLevelLimits(0, 0)

async function getCacheSize() {
  return new Promise((resolve) => {
    session.getCacheSize((size) => {
      resolve(size)
    })
  })
}
async function getConfig() {
  const proxyConfig = await mainDb.getProxyConfig()
  const serverConfig = await mainDb.getServerConfig()
  const cacheSize = await getCacheSize()
  const downloadConfig = await mainDb.getDownloadConfig()
  const hotkeyConfig = await mainDb.getHotKeyConfig()
  const isAutoLaunch = autoLaunch.isEnabled()
  return {
    proxyConfig,
    serverConfig,
    cacheSize,
    downloadConfig,
    hotkeyConfig,
    isAutoLaunch,
  }
}
async function render () {
	const res = await getConfig()
	await store.commit('SAVR_CON',res)
	new Vue({
	  store,
    render: h => h(Preference)
  }).$mount('#preference')
}
render()