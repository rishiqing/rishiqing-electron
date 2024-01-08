<script setup lang="ts">
import Welcome from './component/Welcome.vue'
import { ref } from 'vue'
import { ipcRenderer } from 'electron'

const welcomeDisplay = ref(true)
const userAgent = window.navigator.userAgent

const url = ref('about:blank')
const preloadFile = ref('')

const webview = ref<null | {
  openDevTools: () => void
  setUserAgent: (userAgent: string) => void
}>(null)

const setUrl = async (currentUrl: string) => {
  const appPath = await ipcRenderer.invoke('get-app-path')
  preloadFile.value = 'file://' + appPath + '/resources/common/preload.js'
  url.value = currentUrl
}

const iframeLoad = () => {
  if (webview.value) {
    webview.value.openDevTools()
  }
}

const domReady = () => {
  if (webview.value) {
    webview.value.setUserAgent(userAgent)
  }
}
</script>

<template>
  <WebView
    v-if="url !== 'about:blank'"
    ref="webview"
    class="webview"
    :src="url"
    id="main-iframe"
    disablewebsecurity
    nodeintegrationinsubframes
    nodeIntegration
    allowpopups
    webpreferences="allowRunningInsecureContent=no, backgroundThrottling=no, webSecurity=no,contextIsolation=no,enableRemoteModule=yes"
    :preload="preloadFile"
    @did-finish-load="iframeLoad"
    @dom-ready="domReady"
  />
  <Welcome
    v-if="welcomeDisplay"
    @display="welcomeDisplay = $event"
    @setUrl="setUrl"
  />
</template>

<style lang="scss" scoped>
.webview {
  width: 100vw;
  height: 100vh;
}
</style>
