<template>
  <div id="preference">
		<div class="section">
			<div class="item">
					<span class="name">开机自启动</span>
					<r-switch v-model="isAutoLaunch" @change="onAutoLaunchChange"/>
			</div>
		</div>
		<r-hotkey :config="hotkeyConfig" @change="onHotkeyChange"/>
		<r-download @change-click="onDownloadChangeClick" @inquiry-change="onInquiryChange" :config="downloadConfig"/>
		<r-cache :size="cacheSize" @clear-click="onCacheClearClick"/>
		<r-proxy @change="onProxyChange" :config="proxyConfig" @test-click="onProxyTestClick"/>
		<r-server v-model="serverConfig" @change="onServerConfigChange"/>
		<r-restore @restore="onRestore"/>
	</div>
</template>

<script>
import electron   from 'electron'
import rswitch    from './pub/Rswitch.vue'
import proxy      from './pub/Proxy.vue'
import server     from './pub/Server.vue'
import hotkey     from './pub/Hotkey.vue'
import cache      from './pub/Cache.vue'
import download   from './pub/Download.vue'
import restore    from './pub/Restore.vue'

const mainBroswerWindow = electron.remote.BrowserWindow.fromId(1)
const mainDb = mainBroswerWindow.mainDb
const session = electron.remote.session.defaultSession
const dialog = electron.remote.dialog
const currentWindow = electron.remote.getCurrentWindow()
const autoLaunch = electron.remote.require('./native/autoLaunch')
const { testProxy } = electron.remote.require('./native/proxy')
async function getConfig() {
	const proxyConfig = await mainDb.getProxyConfig()
	const serverConfig = await mainDb.getServerConfig()
	const cacheSize = await session.getCacheSize()
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

export default {
  name: "preference",
  components: {
    'r-switch' : rswitch,
    'r-proxy' : proxy,
    'r-server' : server,
    'r-hotkey' : hotkey,
    'r-cache' : cache,
    'r-download': download,
    'r-restore': restore
  },
  beforeCreate () {
    this.defaultConfig = this.$store.state.config
  },
  data () {
    return {
      defaultConfig:{},
      proxyConfig: this.defaultConfig.proxyConfig,
      serverConfig: {
        enablePrivate: this.defaultConfig.serverConfig. enablePrivate,
        privateUrl: this.defaultConfig.serverConfig.privateUrl,
      },
      cacheSize: this.defaultConfig.cacheSize,
      downloadConfig: {
        inquiryDownloadPath: this.defaultConfig.downloadConfig.inquiryDownloadPath,
        downloadPath: this.defaultConfig.downloadConfig.downloadPath,
      },
      hotkeyConfig: this.defaultConfig.hotkeyConfig,
      isAutoLaunch: this.defaultConfig.isAutoLaunch,
    }
	},
	methods: {
   // 当代理配置改变的时候
		onProxyChange(config) {
			mainDb.updateProxyConfig(config)
		},
		onServerConfigChange(config) {
			mainDb.updateServerConfig({
				enablePrivate: config.enablePrivate,
				privateUrl: config.privateUrl,
			})
		},
		onCacheClearClick() {
			session.clearCache(() => {})
		},
		onDownloadChangeClick() {
			dialog.showOpenDialog({
				defaultPath: this.downloadConfig.downloadPath,
				properties: ['openDirectory', 'createDirectory']
			}, (filePaths) => {
				if (filePaths && filePaths.length) {
					this.downloadConfig.downloadPath = filePaths[0]
					mainDb.updateDownloadConfig({
						downloadPath: this.downloadConfig.downloadPath
					})
				}
			})
		},
		onInquiryChange(val) {
			mainDb.updateDownloadConfig({
				inquiryDownloadPath: val
			})
		},
		onHotkeyChange(config) {
			mainDb.updateHotkeyConfig(config)
		},
		onAutoLaunchChange(value) {
			if (value) autoLaunch.enable()
			else autoLaunch.disable()
		},
		async onRestore() {
			mainDb.restore()
			autoLaunch.disable()
      const config = await getConfig()
			this.proxyConfig = config.proxyConfig
			this.serverConfig = {
				enablePrivate: config.serverConfig. enablePrivate,
				privateUrl: config.serverConfig.privateUrl,
			}
			this.cacheSize = config.cacheSize
			this.downloadConfig = {
				inquiryDownloadPath: config.downloadConfig.inquiryDownloadPath,
				downloadPath: config.downloadConfig.downloadPath,
			}
			this.hotkeyConfig = config.hotkeyConfig
			this.isAutoLaunch = config.isAutoLaunch
		},
		async onProxyTestClick() {
			const result = await testProxy()
			dialog.showMessageBox(currentWindow, {
				type: result.alive ? 'info' : 'error',
				message: result.alive ? '代理可用' : result.message
			})
		}
	}
}
</script>

<style>
*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
}
html, body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Noto Sans", "Noto Sans CJK SC", "Microsoft YaHei", "\5FAE\8F6F\96C5\9ED1", SimSun, sans-serif;
}
ul {
  margin: 0;
  padding: 0;
  list-style: none;
}
.hide {
  display: none !important;
}

#preference {
  padding: 0 40px;
}

.section + .section {
  border-top: 1px solid #E0E0E0;
}

.section {
  padding: 28px 0;
}
.section .title {
  font-size: 13px;
  color: #B1B1B1;
}
.section .content {
  padding-top: 20px;
}
.section .item, .section .item-half {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.section .item .name, .section .item-half .name {
  font-size: 14px;
  color: #3B3B3B;
}
.section .item > input[type="text"], .section .item > input[type="password"], .section .item-half > input[type="text"], .section .item-half > input[type="password"] {
  height: 30px;
  border-radius: 15px;
  border: 1px solid #ddd;
  padding: 0 15px;
  width: 148px;
  outline: none;
}
.section .item > input[type="text"][readonly], .section .item > input[type="password"][readonly], .section .item-half > input[type="text"][readonly], .section .item-half > input[type="password"][readonly] {
  background-color: #f7f7f7;
  cursor: default;
}
.section .item > select, .section .item-half > select {
  -webkit-appearance: none;
  height: 30px;
  outline: none;
  width: 148px;
  background: none;
  border: 1px solid #ddd;
  border-radius: 15px;
  font-size: 12px;
  color: #8C8C8C;
  padding: 0 15px;
  background: url(../../assets/img/arrow.png) no-repeat scroll 124px center transparent;
}
.section .item.private-server input, .section .item-half.private-server input {
  width: 260px;
}
.section .item.download-path .r-input, .section .item-half.download-path .r-input {
  width: 260px;
}
.section .item.proxy-test button, .section .item-half.proxy-test button {
  width: 48px;
  height: 30px;
  background: #6BC859;
  border-radius: 15px;
  border: none;
  color: #fff;
  outline: none;
  cursor: pointer;
  font-size: 12px;
}
.section .item + .item {
  margin-top: 12px;
}
.section .item-half {
  width: 216px;
}
.section.restore-setting {
  padding-top: 0px;
}
.section.restore-setting .content {
  text-align: center;
}
.section.restore-setting .content button {
  height: 24px;
  width: 72px;
  border: 1px solid #d1d1d1;
  border-radius: 2px;
  background: none;
  font-size: 13px;
  text-align: center;
  color: #b1b1b1;
  transition: color 0.2s ease;
  cursor: pointer;
  outline: none;
}
.section.restore-setting .content button:hover {
  color: #3B3B3B;
}

</style>
