<template>
  <div id="index">
    <WebView
      src="about:blank"
      id="main-iframe"
      disablewebsecurity
      nodeintegrationinsubframes
      nodeIntegration
      ref="mainIframe"
      :preload="preloadFile"
      allowpopups
      webpreferences="allowRunningInsecureContent=no, backgroundThrottling=no, webSecurity=no,contextIsolation=no,enableRemoteModule=yes"
      :userAgent="userAgent"
      @did-finish-load="iframeLoad"
    />
    <div id="loading" ref="loading" v-show="loadingDisplay">
      <div
        class="loading-splash"
        ref="loadingSplash"
        v-show="loadingSplashDisplay"
      >
        <img
          class="tip animated rotate infinite"
          src="../../assets/img/arrow-2.png"
        />
      </div>
      <div
        class="network-error"
        title="点击重试"
        ref="networkError"
        v-show="networkErrorDisplay"
        @click="networkErrorClick"
      >
        <span class="tip">无法连接服务器，请检查网络后再试</span>
        <img class="reload" src="../../assets/img/arrow-1.png" alt="点击重试" />
      </div>
    </div>
    <welcome
      v-show="welcomeDisplay"
      @display="welcomeDisplayControl"
      @setUrl="setUrl"
    />
  </div>
</template>

<script>
const package_json = electron.remote.require("./package.json");
// webview现在src不能空值，about:blank替代
import electron from "electron";
import Welcome from "./pub/Welcome.vue";
import config from "../utils/config.js";
const preloadFile = "file://" + electron.remote.app.getAppPath() + "/common/preload.js";

const PRELOAD_EVENTS = electron.remote.require("./common/preload_event");
const util = electron.remote.require("./native/util");
const urlPackage = electron.remote.require("url");
const mainBroswerWindow = electron.remote.BrowserWindow.fromId(1);
const db = mainBroswerWindow.mainDb;
export default {
  name: "index",
  components: {
    welcome: Welcome
  },
  data() {
    return {
      loadingDisplay: true,
      loadingSplashDisplay: false,
      networkErrorDisplay: false,
      welcomeDisplay: false,
      AnimationEnd: "webkitAnimationEnd",
      SERVER_URL: "https://www.rishiqing.com",
      platform: window.process.platform,
      Client_Can_Auto_Login_Data: "",
      preloadFile,
      userAgent: window.navigator.userAgent
    };
  },
  mounted() {
    const that = this;
    this.$refs.mainIframe.addEventListener("context-menu", () => {
      const menuTpl = [
        {
          label: "撤销",
          accelerator: "CommandOrControl+Z",
          role: "undo"
        },
        {
          label: "重做",
          accelerator: "CommandOrControl+Y",
          role: "redo"
        },
        {
          type: "separator"
        },
        {
          label: "剪切",
          accelerator: "CommandOrControl+X",
          role: "cut"
        },
        {
          label: "复制",
          accelerator: "CommandOrControl+C",
          role: "copy"
        },
        {
          label: "粘贴",
          accelerator: "CommandOrControl+V",
          role: "paste"
        },
        {
          label: "全选",
          accelerator: "CommandOrControl+A",
          role: "selectall"
        },
        {
          type: "separator"
        },
        {
          label: "前进",
          visible: true,
          click() {
            that.forwardWindow();
          }
        },
        {
          label: "后退",
          visible: true,
          click() {
            that.backWindow();
          }
        },
        {
          label: "刷新",
          accelerator: "CommandOrControl+R",
          click() {
            that.reloadWindow();
          }
        }
      ];
      const menu = (electron.Menu || electron.remote.Menu).buildFromTemplate(
        menuTpl
      );

      menu.popup(mainBroswerWindow);
    });
    //刷新
    db.event.on(db.EVENTS.Reload, () => {
      this.reloadWindow();
    });
    if (this.platform === "win32") {
      document.body.classList.add("win");
    } else if (this.platform === "darwin") {
      document.body.classList.add("mac");
    }
    this.getServerConfig();
  },
  methods: {
    reloadWindow() {
      this.loadingShow();
      this.$refs.mainIframe.reload();
    },
    backWindow() {
      if (this.$refs.mainIframe.canGoBack()) {
        this.$refs.mainIframe.goBack();
      }
    },
    forwardWindow() {
      if (this.$refs.mainIframe.canGoForward()) {
        this.$refs.mainIframe.goForward();
      }
    },
    isAppPage() {
      if (this.$refs.mainIframe) {
        const href = this.$refs.mainIframe.getURL();
        if (href && href.indexOf(config.WEBSITE + "app") === 0) {
          return true;
        } else return false;
      }
    },
    loadingShow() {
      if (this.isAppPage()) this.loadingShowMore("pureColor");
      else this.loadingShowMore();
    },
    loadingHideMore() {
      const that = this;
      const hideAnimate = () => {
        that.loadingDisplay = false;
        that.$refs.loading.classList.remove("animated", "fadeOut");
        that.$refs.loading.removeEventListener(that.AnimationEnd, hideAnimate);
      };
      this.$refs.loading.addEventListener(
        this.AnimationEnd,
        hideAnimate,
        false
      );
      this.$refs.loading.classList.add("animated", "fadeOut");
    },
    loadingShowMore(type) {
      const that = this;
      this.$refs.loading.classList.remove("animated", "fadeOut");
      if (this.loadingDisplay === false) {
        this.loadingDisplay = true;
        const showAnimate = () => {
          that.loadingDisplay = true;
          that.$refs.loading.classList.remove("animated", "fadeIn");
          that.$refs.loading.removeEventListener(
            that.AnimationEnd,
            showAnimate
          );
        };
        this.$refs.loading.addEventListener(
          that.AnimationEnd,
          showAnimate,
          false
        );
        this.$refs.loading.classList.add("animated", "fadeIn");
      }
      this.networkErrorDisplay = false;
      this.loadingSplashDisplay = false;
      this.$refs.loading.classList.remove("pure-color");
      if (type === "networkError") {
        this.showNetworkError();
      } else if (type === "pureColor") {
        this.showPureColor();
      } else {
        this.showSplash();
      }
    },
    showSplash() {
      this.loadingSplashDisplay = true;
      this.networkErrorDisplay = false;
    },
    showNetworkError() {
      this.loadingSplashDisplay = false;
      this.networkErrorDisplay = true;
    },
    showPureColor() {
      this.$refs.loading.classList.add("pure-color");
    },
    networkErrorClick() {
      this.showSplash();
      setTimeout(() => {
        this.$refs.mainIframe.reload();
      }, 1000);
    },
    welcomeDisplayControl(type) {
      this.welcomeDisplay = type;
    },
    setUrl(url) {
      this.$refs.mainIframe.loadURL(url);
    },
    handleBar(pressed) {
      if (this.platform === "win32") {
        if (pressed.which === 116) {
          this.loadingShow();
          this.$refs.mainIframe.reload();
        }
      } else if (this.platform === "darwin") {
        if (pressed.metaKey && pressed.which === 82) {
          this.loadingShow();
          this.$refs.mainIframe.reload();
        }
      }
    },
    iframeLoad() {
      if (
        this.$refs.mainIframe.src &&
        this.$refs.mainIframe.src !== "about:blank"
      ) {
        this.loadingHideMore();
        this.$refs.mainIframe.removeEventListener("keydown", this.handleBar);
        this.$refs.mainIframe.addEventListener(
          "keydown",
          this.handleBar,
          false
        );

        if (package_json.env === "dev" || package_json.env === "debug") {
          this.$refs.mainIframe.openDevTools();
        }
        //监听打开webview调试器
        db.event.on(db.EVENTS.DevTool, () => {
          if (this.$refs.mainIframe) this.$refs.mainIframe.openDevTools();
        });
        this.$refs.mainIframe.addEventListener("ipc-message", event => {
          if (event.channel === PRELOAD_EVENTS.Preload_Can_Auto_Login) {
            this.dealLogin(event.args.length ? event.args[0] : "");
          }
          if (event.channel === PRELOAD_EVENTS.Preload_On_Logout) {
            this.onLogout();
          }
        });
      }
    },
    dealLogin(canAutoLogin) {
      if (!canAutoLogin) {
        this.welcomeDisplayControl(true);
        this.$refs.mainIframe.src = "about:blank";
      }
    },
    onLogout() {
      this.welcomeDisplayControl(true);
      this.$refs.mainIframe.src = "about:blank";
    },
    async getServerConfig() {
      const serverConfig = await db.getServerConfig();
      if (package_json.env === "debug") {
        this.SERVER_URL = package_json["debug-server"];
      } else {
        if (serverConfig.enablePrivate) {
          this.SERVER_URL = serverConfig.privateUrl;
        } else {
          this.SERVER_URL = serverConfig.officelUrl;
        }
      }
      if (!this.SERVER_URL) {
        this.welcomeDisplayControl(true);
        return;
      }
      const result = await util.testServer(this.SERVER_URL);
      if (!result.alive) {
        this.welcomeDisplayControl(true);
      } else {
        this.$refs.mainIframe.loadURL(
          urlPackage.resolve(this.SERVER_URL, "/app")
        );
      }
    }
  }
};
</script>

<style>
@font-face {
  font-family: "icomoon";
  src: url(data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAAATAAAsAAAAABHQAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABPUy8yAAABCAAAAGAAAABgDxIFP2NtYXAAAAFoAAAAVAAAAFQXQdKxZ2FzcAAAAbwAAAAIAAAACAAAABBnbHlmAAABxAAAALgAAAC4ZePE5GhlYWQAAAJ8AAAANgAAADYPQOfYaGhlYQAAArQAAAAkAAAAJAdVA8ZobXR4AAAC2AAAABQAAAAUCgAAbWxvY2EAAALsAAAADAAAAAwAKABwbWF4cAAAAvgAAAAgAAAAIAAHACNuYW1lAAADGAAAAYYAAAGGmUoJ+3Bvc3QAAASgAAAAIAAAACAAAwAAAAMDAAGQAAUAAAKZAswAAACPApkCzAAAAesAMwEJAAAAAAAAAAAAAAAAAAAAARAAAAAAAAAAAAAAAAAAAAAAQAAA6RUDwP/AAEADwABAAAAAAQAAAAAAAAAAAAAAIAAAAAAAAwAAAAMAAAAcAAEAAwAAABwAAwABAAAAHAAEADgAAAAKAAgAAgACAAEAIOkV//3//wAAAAAAIOkV//3//wAB/+MW7wADAAEAAAAAAAAAAAAAAAEAAf//AA8AAQAAAAAAAAAAAAIAADc5AQAAAAABAAAAAAAAAAAAAgAANzkBAAAAAAEAAAAAAAAAAAACAAA3OQEAAAAAAQBtAC0DkwNTACAAAAkBJiIHBhQXCQEGFBcWMjcJARYyNzY0JwkBNjQnJiIHAQIA/pMIFggICAFs/pQICAgWCAFtAW0IFggICP6UAWwICAgWCP6TAecBbAgICBYI/pP+kwgWCAgIAWz+lAgICBYIAW0BbQgWCAgI/pQAAAEAAAABAACxovatXw889QALBAAAAAAA1kfRxAAAAADWR9HEAAAAAAOTA1MAAAAIAAIAAAAAAAAAAQAAA8D/wAAABAAAAAAAA5MAAQAAAAAAAAAAAAAAAAAAAAUEAAAAAAAAAAAAAAACAAAABAAAbQAAAAAACgAUAB4AXAABAAAABQAhAAEAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAADgCuAAEAAAAAAAEABwAAAAEAAAAAAAIABwBgAAEAAAAAAAMABwA2AAEAAAAAAAQABwB1AAEAAAAAAAUACwAVAAEAAAAAAAYABwBLAAEAAAAAAAoAGgCKAAMAAQQJAAEADgAHAAMAAQQJAAIADgBnAAMAAQQJAAMADgA9AAMAAQQJAAQADgB8AAMAAQQJAAUAFgAgAAMAAQQJAAYADgBSAAMAAQQJAAoANACkaWNvbW9vbgBpAGMAbwBtAG8AbwBuVmVyc2lvbiAxLjAAVgBlAHIAcwBpAG8AbgAgADEALgAwaWNvbW9vbgBpAGMAbwBtAG8AbwBuaWNvbW9vbgBpAGMAbwBtAG8AbwBuUmVndWxhcgBSAGUAZwB1AGwAYQByaWNvbW9vbgBpAGMAbwBtAG8AbwBuRm9udCBnZW5lcmF0ZWQgYnkgSWNvTW9vbi4ARgBvAG4AdAAgAGcAZQBuAGUAcgBhAHQAZQBkACAAYgB5ACAASQBjAG8ATQBvAG8AbgAuAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==)
    format("woff");
  font-weight: normal;
  font-style: normal;
}
[class^="icon-"],
[class*=" icon-"] {
  font-family: "icomoon" !important;
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

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
}

html,
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Noto Sans",
    "Noto Sans CJK SC", "Microsoft YaHei", "\5FAE\8F6F\96C5\9ED1", SimSun,
    sans-serif;
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
  background: #5a98d4;
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
.btn.disabled,
.btn:disabled {
  cursor: not-allowed;
  background-color: #e0e0e0 !important;
  background-image: none;
}

#main-iframe {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  border: none;
  width: 100%;
  top: 0px;
  height: 100%;
}
#loading {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  -webkit-user-select: none;
  background-image: linear-gradient(-179deg, #e4edf5 0%, #d8ecff 99%);
}
#loading.pure-color {
  background: linear-gradient(0deg, #d8ecff, #e4edf5);
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
  background-image: linear-gradient(-180deg, #1588ff 0, #06c4ff 100%);
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
</style>
