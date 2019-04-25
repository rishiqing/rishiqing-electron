<template>
  <div id="index">
    <div class="drag-bar-mac" style="-webkit-app-region: drag;" @dblclick.stop="full($event)">
      <div class="traffic-lights mac" style="-webkit-app-region: no-drag;">
          <span class="close" @click="close">
            <img src="../../assets/img/mac-traffic-light-close.svg" class="normal">
            <img src="../../assets/img/mac-traffic-light-close-hover.svg" class="hover">
          </span>
          <span class="minimize" @click="minimize">
            <img src="../../assets/img/mac-traffic-light-minimize.svg" class="normal">
            <img src="../../assets/img/mac-traffic-light-minimize-hover.svg" class="hover">
          </span>
          <span class="zoom" @click="zoom">
            <img src="../../assets/img/mac-traffic-light-zoom.svg" class="normal">
            <img src="../../assets/img/mac-traffic-light-zoom-hover.svg" class="hover">
          </span>
      </div>
    </div>
    <div class="drag-bar-win" style="-webkit-app-region: drag;" @dblclick.stop="full($event)">
      <div class="traffic-lights" style="-webkit-app-region: no-drag">
        <span class="minimize" @click="minimize">
          <img src="../../assets/img/win-minimize.svg">
        </span>
        <span class="zoom" @click="zoom">
          <img src="../../assets/img/win-zoom.svg">
        </span>
        <span class="close" @click="close">
          <img src="../../assets/img/win-close.svg">
        </span>
      </div>
    </div>
    <iframe id="main-iframe" allowFullscreen="true" ref="mainIframe" @load="iframeLoad"></iframe>
    <div id="loading" ref="loading" v-show="loadingDisplay">
      <div class="loading-splash" ref="loadingSplash" v-show="loadingSplashDisplay">
        <img class="tip animated rotate infinite" src="../../assets/img/arrow-2.png">
      </div>
      <div class="network-error" title="点击重试" ref="networkError" v-show="networkErrorDisplay" @click="networkErrorClick">
        <span class="tip">无法连接服务器，请检查网络后再试</span>
        <img class="reload" src="../../assets/img/arrow-1.png" alt="点击重试">
      </div>
    </div>
    <audio :src='ogg' id="notification-sound"></audio>
    <welcome v-show="welcomeDisplay" @display="welcomeDisplayControl" @setUrl="setUrl"/>
  </div>
</template>

<script>
import electron     from 'electron'
import Welcome      from './pub/Welcome.vue'
import config       from '../utils/config.js'
import notification from '../utils/notification.js'
import nativeNotify from '../utils/nativeNotify.js'
import ogg          from '../../assets/sound/Tethys.ogg'

const package_json = electron.remote.require('./package.json')
const util = electron.remote.require('./native/util')
const urlPackage = electron.remote.require('url')
const os = electron.remote.require('os')
const mainBroswerWindow = electron.remote.BrowserWindow.fromId(1)
const db = mainBroswerWindow.mainDb
export default {
  name: "index",
  components: {
    'welcome' : Welcome
  },
  data(){
    return {
      loadingDisplay:true,
      loadingSplashDisplay:false,
      networkErrorDisplay:false,
      welcomeDisplay:false,
      ogg,
      AnimationEnd:'webkitAnimationEnd',
      SERVER_URL:'https://www.rishiqing.com',
      platform: window.process.platform,
      Client_Can_Auto_Login_Data:''
    }
  },
  mounted () {
    const that = this;
    (mainBroswerWindow.webContents || mainBroswerWindow.getWebContents()).on('context-menu', () => {
      const menuTpl = [
        {
          label: '撤销',
          accelerator: 'CommandOrControl+Z',
          role: 'undo'
        },
        {
          label: '重做',
          accelerator: 'CommandOrControl+Y',
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          label: '剪切',
          accelerator: 'CommandOrControl+X',
          role: 'cut'
        },
        {
          label: '复制',
          accelerator: 'CommandOrControl+C',
          role: 'copy'
        },
        {
          label: '粘贴',
          accelerator: 'CommandOrControl+V',
          role: 'paste'
        },
        {
          label: '全选',
          accelerator: 'CommandOrControl+A',
          role: 'selectall'
        },
        {
          type: 'separator'
        },
        {
          label: '前进',
          visible: true,
          click() {
            that.forwardWindow()
          }
        }, 
        {
          label: '后退',
          visible: true,
          click () {
            that.backWindow()
          }
        }, 
        {
          label: '刷新',
          visible: true,
          accelerator: 'CommandOrControl+R',
          click () {
            that.reloadWindow()
          }
        }
      ]
      const menu = (electron.Menu || electron.remote.Menu).buildFromTemplate(menuTpl)
      menu.popup(mainBroswerWindow)
    })
    if (this.platform === 'win32') {
      document.body.classList.add('win')
    } else if (this.platform === 'darwin') {
      document.body.classList.add('mac')
    }
    this.getServerConfig()
  },
  methods: {
    reloadWindow () {
      this.loadingShow()
      this.$refs.mainIframe.contentWindow.location.reload()
    },
    backWindow () {
      this.$refs.mainIframe.contentWindow.history.back()
    },
    forwardWindow () {
      this.$refs.mainIframe.contentWindow.history.forward()
    },
    isAppPage () {
      const href = this.$refs.mainIframe.contentWindow.location.href
      if (href && href.indexOf(config.WEBSITE + 'app') === 0) {
        return true
      } else return false
    },
    loadingShow () {
      if (this.isAppPage()) this.loadingShowMore('pureColor')
      else this.loadingShowMore()
    },
    loadingHideMore () {
      const that = this
      const hideAnimate = () => {
        that.loadingDisplay = false
        that.$refs.loading.classList.remove('animated','fadeOut')
        that.$refs.loading.removeEventListener(that.AnimationEnd, hideAnimate)
      }
      this.$refs.loading.addEventListener(this.AnimationEnd, hideAnimate, false)
      this.$refs.loading.classList.add('animated','fadeOut')
    },
    loadingShowMore (type) {
      const that = this
      this.$refs.loading.classList.remove('animated','fadeOut')
      if (this.loadingDisplay === false) {
        this.loadingDisplay = true
        const showAnimate = () => {
          that.loadingDisplay = true
          that.$refs.loading.classList.remove('animated','fadeIn')
          that.$refs.loading.removeEventListener(that.AnimationEnd, showAnimate)
        }
        this.$refs.loading.addEventListener(that.AnimationEnd, showAnimate,false)
        this.$refs.loading.classList.add('animated','fadeIn')
      }
      this.networkErrorDisplay = false
      this.loadingSplashDisplay = false
      this.$refs.loading.classList.remove('pure-color')
      if (type === 'networkError') {
        this.showNetworkError()
      } else if (type === 'pureColor') {
        this.showPureColor()
      } else {
        this.showSplash()
      }
    },
    showSplash () {
      this.loadingSplashDisplay = true
      this.networkErrorDisplay = false
    },
    showNetworkError () {
      this.loadingSplashDisplay = false
      this.networkErrorDisplay = true
    },
    showPureColor () {
      this.$refs.loading.classList.add('pure-color')
    },
    networkErrorClick () {
      this.showSplash()
      setTimeout(() => {
        this.$refs.mainIframe.contentWindow.location.reload()
      }, 1000)
    },
    welcomeDisplayControl (type) {
      this.welcomeDisplay = type
    },
    setUrl (url) {
      this.$refs.mainIframe.src = url
    },
    handleBar (pressed) {
      if (this.platform === 'win32') {
        if (pressed.which === 116) {
          this.loadingShow()
          this.$refs.mainIframe.contentWindow.location.reload()
        }
      } else if (this.platform === 'darwin') {
        if (pressed.metaKey && pressed.which === 82) {
          this.loadingShow()
          this.$refs.mainIframe.contentWindow.location.reload()
        }
      }
    },
    iframeLoad () {
      if (this.$refs.mainIframe.src) {
        this.loadingHideMore()
        this.$refs.mainIframe.contentWindow.document.removeEventListener('keydown', this.handleBar)
        this.$refs.mainIframe.contentWindow.document.addEventListener('keydown', this.handleBar, false)
        this.$refs.mainIframe.contentWindow.confirm = (message) => {
          return window.confirm(message, '日事清')
        }
        this.$refs.mainIframe.contentWindow.alert = (message) => {
          return window.alert(message, '日事清')
        }
        if (this.$refs.mainIframe.contentWindow.I_AM_RSQ_WEB) {
          this.rishiqingWeb(this.$refs.mainIframe.contentWindow)
        }
      }
    },
    dealLogin (canAutoLogin) {
      if (!canAutoLogin) {
        this.welcomeDisplayControl(true)
        this.$refs.mainIframe.src = ''
      }
    },
    rishiqingWeb (mainWindow) {
      const that = this
      mainWindow.VERSIONSTAMP = {
        version: package_json.version,
        time: package_json.releaseTime || (new Date()).toString()
      }
      // 替换我们基于windows.Notification开发的通知模块，主要针对在win7下，只能使用balloon进行通知的问题
      if (this.platform === 'win32') {
        const release = os.release()
        const first = parseInt(release.split('.')[0], 10)
        if (first !== 10) { // 判断在windows以下都用自己开发的Notification来进行通知
          mainWindow.Notification = nativeNotify 
        } else { // 如果是win10
          mainWindow.Notification = notification
        }
      }
      if (this.platform === 'darwin') {
        mainWindow.Notification = notification
      }
      mainWindow.Object.defineProperty(mainWindow.document, 'hidden', {
        configurable: true,
        get() {
          if (!mainBroswerWindow.isVisible()) return true
          if (mainBroswerWindow.isMinimized()) return true
          if (!mainBroswerWindow.isFocused()) return true
          return false
        },
        set() {}
      })
      mainWindow.onLogout = () => {
        that.welcomeDisplayControl(true)
        that.$refs.mainIframe.src = ''
      }
      mainWindow.onHeaderDblclick = () => {
        if (this.platform !== 'darwin') return
        if (mainBroswerWindow.isMaximized()) {
          mainBroswerWindow.unmaximize()
        } else {
          mainBroswerWindow.maximize()
        }
      }
      if (mainWindow.Client_Can_Auto_Login !== undefined) {
        this.dealLogin(mainWindow.Client_Can_Auto_Login)
      }
      this.Client_Can_Auto_Login_Data = mainWindow.Client_Can_Auto_Login
      mainWindow.Object.defineProperty(mainWindow, 'Client_Can_Auto_Login', {
        configurable: true,
        get() {
          return that.Client_Can_Auto_Login_Data
        },
        set (v) {
          that.Client_Can_Auto_Login_Data = v
          that.dealLogin(v)
        }
      })
    },
    async getServerConfig () {
      const serverConfig = await db.getServerConfig()
      if (package_json.env === 'debug') {
        this.SERVER_URL = package_json['debug-server']
      } else {
        if (serverConfig.enablePrivate) {
          this.SERVER_URL = serverConfig.privateUrl
        } else {
          this.SERVER_URL = serverConfig.officelUrl
        }
      }
      if (!this.SERVER_URL) {
        this.welcomeDisplayControl(true)
        return
      }
      const result = await util.testServer(this.SERVER_URL)
      if (!result.alive) {
        this.welcomeDisplayControl(true)
      } else {
        this.$refs.mainIframe.src = urlPackage.resolve(this.SERVER_URL, '/app')
      }
    },
    close() {
      mainBroswerWindow.close()
    },
    minimize () {
      mainBroswerWindow.minimize()
    },
    zoom () {
      // 在windows平台就执行最大化，在其他平台就直接全屏
      if (this.platform === 'win32') {
        if (mainBroswerWindow.isMaximized()) {
          mainBroswerWindow.unmaximize()
        } else {
          mainBroswerWindow.maximize()
        }
      } else {
        if (mainBroswerWindow.isFullScreen()) {
          mainBroswerWindow.setFullScreen(false)
        } else {
          mainBroswerWindow.setFullScreen(true)
        }
      }
    },
    full(e){
      e.preventDefault()
      if (mainBroswerWindow.isMaximized()) {
          mainBroswerWindow.unmaximize()
        } else {
          mainBroswerWindow.maximize()
      }
    }
  }
}
</script>

<style>
@font-face {
  font-family: 'icomoon';
  src: url(data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAAATAAAsAAAAABHQAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABPUy8yAAABCAAAAGAAAABgDxIFP2NtYXAAAAFoAAAAVAAAAFQXQdKxZ2FzcAAAAbwAAAAIAAAACAAAABBnbHlmAAABxAAAALgAAAC4ZePE5GhlYWQAAAJ8AAAANgAAADYPQOfYaGhlYQAAArQAAAAkAAAAJAdVA8ZobXR4AAAC2AAAABQAAAAUCgAAbWxvY2EAAALsAAAADAAAAAwAKABwbWF4cAAAAvgAAAAgAAAAIAAHACNuYW1lAAADGAAAAYYAAAGGmUoJ+3Bvc3QAAASgAAAAIAAAACAAAwAAAAMDAAGQAAUAAAKZAswAAACPApkCzAAAAesAMwEJAAAAAAAAAAAAAAAAAAAAARAAAAAAAAAAAAAAAAAAAAAAQAAA6RUDwP/AAEADwABAAAAAAQAAAAAAAAAAAAAAIAAAAAAAAwAAAAMAAAAcAAEAAwAAABwAAwABAAAAHAAEADgAAAAKAAgAAgACAAEAIOkV//3//wAAAAAAIOkV//3//wAB/+MW7wADAAEAAAAAAAAAAAAAAAEAAf//AA8AAQAAAAAAAAAAAAIAADc5AQAAAAABAAAAAAAAAAAAAgAANzkBAAAAAAEAAAAAAAAAAAACAAA3OQEAAAAAAQBtAC0DkwNTACAAAAkBJiIHBhQXCQEGFBcWMjcJARYyNzY0JwkBNjQnJiIHAQIA/pMIFggICAFs/pQICAgWCAFtAW0IFggICP6UAWwICAgWCP6TAecBbAgICBYI/pP+kwgWCAgIAWz+lAgICBYIAW0BbQgWCAgI/pQAAAEAAAABAACxovatXw889QALBAAAAAAA1kfRxAAAAADWR9HEAAAAAAOTA1MAAAAIAAIAAAAAAAAAAQAAA8D/wAAABAAAAAAAA5MAAQAAAAAAAAAAAAAAAAAAAAUEAAAAAAAAAAAAAAACAAAABAAAbQAAAAAACgAUAB4AXAABAAAABQAhAAEAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAADgCuAAEAAAAAAAEABwAAAAEAAAAAAAIABwBgAAEAAAAAAAMABwA2AAEAAAAAAAQABwB1AAEAAAAAAAUACwAVAAEAAAAAAAYABwBLAAEAAAAAAAoAGgCKAAMAAQQJAAEADgAHAAMAAQQJAAIADgBnAAMAAQQJAAMADgA9AAMAAQQJAAQADgB8AAMAAQQJAAUAFgAgAAMAAQQJAAYADgBSAAMAAQQJAAoANACkaWNvbW9vbgBpAGMAbwBtAG8AbwBuVmVyc2lvbiAxLjAAVgBlAHIAcwBpAG8AbgAgADEALgAwaWNvbW9vbgBpAGMAbwBtAG8AbwBuaWNvbW9vbgBpAGMAbwBtAG8AbwBuUmVndWxhcgBSAGUAZwB1AGwAYQByaWNvbW9vbgBpAGMAbwBtAG8AbwBuRm9udCBnZW5lcmF0ZWQgYnkgSWNvTW9vbi4ARgBvAG4AdAAgAGcAZQBuAGUAcgBhAHQAZQBkACAAYgB5ACAASQBjAG8ATQBvAG8AbgAuAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==) format("woff");
  font-weight: normal;
  font-style: normal;
}
[class^="icon-"], [class*=" icon-"] {
  font-family: 'icomoon' !important;
  speak: none;
  font-style: normal;
  font-weight: normal;
  font-constiant: normal;
  text-transform: none;
  line-height: 1;
  padding: 0 1px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.icon-cancel:before {
  content: "\e915";
}

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
.animated {
  -webkit-animation-duration: 1s;
  animation-duration: 1s;
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
}

.animated.infinite {
  -webkit-animation-iteration-count: infinite;
  animation-iteration-count: infinite;
}

.animated.hinge {
  -webkit-animation-duration: 2s;
  animation-duration: 2s;
}

@-webkit-keyframes rotate {
  from {
    transform: rotate(0deg);
    -ms-transform: rotate(0deg);
    -moz-transform: rotate(0deg);
    -webkit-transform: rotate(0deg);
    -o-transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
    -ms-transform: rotate(360deg);
    -moz-transform: rotate(360deg);
    -webkit-transform: rotate(360deg);
    -o-transform: rotate(360deg);
  }
}
@-moz-keyframes rotate {
  from {
    transform: rotate(0deg);
    -ms-transform: rotate(0deg);
    -moz-transform: rotate(0deg);
    -webkit-transform: rotate(0deg);
    -o-transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
    -ms-transform: rotate(360deg);
    -moz-transform: rotate(360deg);
    -webkit-transform: rotate(360deg);
    -o-transform: rotate(360deg);
  }
}
@-o-keyframes rotate {
  from {
    transform: rotate(0deg);
    -ms-transform: rotate(0deg);
    -moz-transform: rotate(0deg);
    -webkit-transform: rotate(0deg);
    -o-transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
    -ms-transform: rotate(360deg);
    -moz-transform: rotate(360deg);
    -webkit-transform: rotate(360deg);
    -o-transform: rotate(360deg);
  }
}
@keyframes rotate {
  from {
    transform: rotate(0deg);
    -ms-transform: rotate(0deg);
    -moz-transform: rotate(0deg);
    -webkit-transform: rotate(0deg);
    -o-transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
    -ms-transform: rotate(360deg);
    -moz-transform: rotate(360deg);
    -webkit-transform: rotate(360deg);
    -o-transform: rotate(360deg);
  }
}
.rotate {
  -webkit-transform-origin: center center;
  -ms-transform-origin: center center;
  transform-origin: center center;
  -webkit-animation-name: rotate;
  animation-name: rotate;
  -webkit-animation-timing-function: linear;
}

@-webkit-keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
@-moz-keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
@-o-keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
.fadeOut {
  -webkit-animation-name: fadeOut;
  animation-name: fadeOut;
}

@-webkit-keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@-moz-keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@-o-keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.fadeIn {
  -webkit-animation-name: fadeIn;
  animation-name: fadeIn;
}

@-webkit-keyframes fadeInDownBig {
  from {
    opacity: 0;
    -webkit-transform: translate3d(0, -2000px, 0);
    transform: translate3d(0, -2000px, 0);
  }
  to {
    opacity: 1;
    -webkit-transform: none;
    transform: none;
  }
}
@-moz-keyframes fadeInDownBig {
  from {
    opacity: 0;
    -webkit-transform: translate3d(0, -2000px, 0);
    transform: translate3d(0, -2000px, 0);
  }
  to {
    opacity: 1;
    -webkit-transform: none;
    transform: none;
  }
}
@-o-keyframes fadeInDownBig {
  from {
    opacity: 0;
    -webkit-transform: translate3d(0, -2000px, 0);
    transform: translate3d(0, -2000px, 0);
  }
  to {
    opacity: 1;
    -webkit-transform: none;
    transform: none;
  }
}
@keyframes fadeInDownBig {
  from {
    opacity: 0;
    -webkit-transform: translate3d(0, -2000px, 0);
    transform: translate3d(0, -2000px, 0);
  }
  to {
    opacity: 1;
    -webkit-transform: none;
    transform: none;
  }
}
.fadeInDownBig {
  -webkit-animation-name: fadeInDownBig;
  animation-name: fadeInDownBig;
}

@-webkit-keyframes fadeOutUpBig {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
    -webkit-transform: translate3d(0, -2000px, 0);
    transform: translate3d(0, -2000px, 0);
  }
}
@-moz-keyframes fadeOutUpBig {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
    -webkit-transform: translate3d(0, -2000px, 0);
    transform: translate3d(0, -2000px, 0);
  }
}
@-o-keyframes fadeOutUpBig {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
    -webkit-transform: translate3d(0, -2000px, 0);
    transform: translate3d(0, -2000px, 0);
  }
}
@keyframes fadeOutUpBig {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
    -webkit-transform: translate3d(0, -2000px, 0);
    transform: translate3d(0, -2000px, 0);
  }
}
.fadeOutUpBig {
  -webkit-animation-name: fadeOutUpBig;
  animation-name: fadeOutUpBig;
}

body.win .welcome-page:before {
  content: "";
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: #5A98D4;
}

.btn {
  background: none;
  border: none;
  outline: none;
  color: #fff;
  width: 160px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  border-radius: 2px;
  padding: 0;
  letter-spacing: 3.15px;
}
.btn.disabled, .btn:disabled {
  cursor: not-allowed;
  background-color: #E0E0E0 !important;
  background-image: none;
}

#main-iframe {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  border: none;
  width: 100%;
  top: 30px;
  height: calc(100% - 30px);
}
#loading {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  -webkit-user-select: none;
  background-image: linear-gradient(-179deg, #E4EDF5 0%, #D8ECFF 99%);
}
#loading.pure-color {
  background: linear-gradient(0deg, #D8ECFF, #E4EDF5);
}

#loading.pure-color .bg-header {
  display: none;
}
#loading .bg-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 62%;
  background-image: linear-gradient(-180deg, #1588FF 0, #06C4FF 100%);
}

#loading .bg-header > img {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 35%;
}

#loading .bg-header .logo {
  width: 88px;
  height: 88px;
  position: absolute;
  top: 35%;
  left: 50%;
  background-size: cover;
  transform: translate(-50%, -50%);
}
#loading .loading-splash {
  position: absolute;
  top: 50%;
  left: 50%;
  background: #f0f0f0;
  box-shadow: 0px 0px 3px 0px rgba(0, 0, 0, 0.33);
  width: 64px;
  height: 64px;
  margin-top: -32px;
  margin-left: -32px;
  border-radius: 100%;
  line-height: 64px;
  text-align: center;
}
#loading .loading-splash .tip {
  vertical-align: middle;
  width: 30px;
  height: 30px;
}
#loading .network-error {
  position: absolute;
  top: 50%;
  left: 50%;
  background: #f0f0f0;
  border: 1px solid #979797;
  border-radius: 4px;
  width: 398px;
  height: 52px;
  margin-left: -199px;
  margin-top: -26px;
  line-height: 52px;
  padding-left: 45px;
  cursor: pointer;
}
#loading .network-error .tip {
  font-family: NotoSansCJKsc-Medium;
  font-size: 18px;
  color: rgba(227, 89, 89, 0.9);
}
#loading .network-error .reload {
  vertical-align: middle;
  margin-top: -6px;
  margin-left: 18px;
}
.drag-bar-mac {
  display: none;
}
.drag-bar-mac .drag-bar {
  position: absolute;
  left: 80px;
  top: 0;
  height: 56px;
  width: calc(50% - 285px);
}
.drag-bar-mac .drag-bar-2 {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  height: 10px;
}
.drag-bar-mac .drag-bar-3 {
  position: absolute;
  left: 0;
  top: 46px;
  right: 0;
  height: 10px;
}

.traffic-lights.mac {
  position: absolute;
  left: 0;
  top: 0;
  height: 30px;
  display: flex;
  z-index: 2;
  justify-content: space-between;
  width: 76px;
  align-items: center;
  padding: 0 12px;
  user-select: none;
}
.traffic-lights.mac > span {
  display: inline-block;
  height: 12px;
  width: 12px;
  border-radius: 50%;
}
.traffic-lights.mac > span img {
  height: 12px;
  width: 12px;
  vertical-align: top;
}
.traffic-lights.mac > span img.hover {
  display: none;
}
.traffic-lights.mac:hover img.normal {
  display: none;
}
.traffic-lights.mac:hover img.hover {
  display: inline-block;
}

.drag-bar-win {
  display: none;
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  height: 30px;
  background:linear-gradient(180deg,rgba(88,157,228,1) 0%,rgba(77,140,202,1) 100%);
  z-index: 2;
}
.drag-bar-win .traffic-lights {
  position: absolute;
  right: 0;
  top: 0;
  height: 30px;
  display: flex;
  z-index: 1;
  justify-content: space-between;
  width: 140px;
  align-items: center;
  padding: 0 18px;
  user-select: none;
}
.drag-bar-win .traffic-lights > span {
  display: inline-block;
  height: 12px;
  width: 12px;
}
.drag-bar-win .traffic-lights > span img {
  vertical-align: top;
}
.drag-bar-win .traffic-lights > span.minimize img {
  vertical-align: bottom;
}
body.mac .drag-bar-mac {
  user-select:none;
  display: block;
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  height: 30px;
  background:linear-gradient(180deg,rgba(88,157,228,1) 0%,rgba(77,140,202,1) 100%);
  z-index: 2;
}

body.win {
  background: #5A98D4;
}
body.win .drag-bar-win {
  user-select:none;
  display: block;
}
body.win .traffic-lights.mac {
  display: none;
}

</style>