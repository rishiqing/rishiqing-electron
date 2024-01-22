<script setup lang="ts">
import url from 'url'
import { ipcRenderer } from 'electron'
import { IpcEvent } from '../../main/utils/eventMessage'
import { ref, onMounted } from 'vue'

const getUrl = async () => {
  const serverConfig = await ipcRenderer.invoke(
    IpcEvent.getStoreValue,
    'serverConfig',
  )
  let serverUrl = ''
  let baseUrl = ''
  if (serverConfig.enablePrivate) {
    serverUrl = serverConfig.privateUrl
    baseUrl = serverConfig.privateBaseUrl
  } else {
    serverUrl = serverConfig.officialUrl
    baseUrl = serverConfig.officialBaseUrl
  }
  return { serverUrl, baseUrl }
}

const login = async () => {
  const { serverUrl } = await getUrl()
  return url.resolve(serverUrl, '/account/login')
}

const sign = async () => {
  const { serverUrl } = await getUrl()
  return url.resolve(serverUrl, '/account/register')
}
const show = ref(true)
const openUrl = async (type: 'login' | 'sign') => {
  if (loading.value) return
  show.value = false
  let url
  if (type === 'login') {
    url = await login()
  } else {
    url = await sign()
  }
  if (url) {
    const result = await ipcRenderer.invoke(IpcEvent.testServer, url)
    if (result.alive) {
      await ipcRenderer.invoke(IpcEvent.showUrl, url)
    } else {
      ipcRenderer.send(IpcEvent.showNetworkError, result.message)
    }
  } else {
    ipcRenderer.send(IpcEvent.showNetworkError, '自定义服务器不可用')
  }
  show.value = true
}

const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const { serverUrl, baseUrl } = await getUrl()
    const mainUrl = url.resolve(serverUrl, baseUrl)
    const result = await ipcRenderer.invoke(IpcEvent.testServer, serverUrl)
    if (result.alive) {
      await ipcRenderer.invoke(IpcEvent.showUrl, mainUrl)
    }
  } finally {
    loading.value = false
  }

  setTimeout(() => {
    loading.value = false
  }, 2500)
})
</script>

<template>
  <transition name="slide-fade">
    <div class="welcome" v-if="show">
      <img src="../assets/welcome.png" draggable="false" />
      <div class="main">
        <img src="../../../resources/img/rishiqing.png" draggable="false" />
        <span class="welcome-text">欢迎使用日事清！</span>
        <div class="login" :class="{ loading }" @click="openUrl('login')">
          <img v-if="loading" src="../assets/loading.svg" />
          <span class="text">登录</span>
        </div>
        <div class="sign" @click="openUrl('sign')">注册</div>
      </div>
    </div>
  </transition>
</template>

<style lang="scss" scoped>
@keyframes load-loop {
  from {
    transform: rotate(0deg);
  }

  50% {
    transform: rotate(180deg);
  }

  to {
    transform: rotate(360deg);
  }
}
.welcome {
  width: 100vw;
  height: 100vh;
  display: flex;
  overflow: hidden;
  user-select: none;

  .main {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    img {
      width: 128px;
      height: 128px;
    }
    &-text {
      color: #333;
      font-family: Noto Sans CJK SC;
      font-size: 20px;
      font-style: normal;
      font-weight: 700;
      line-height: 28px;
      letter-spacing: 4px;
      text-align: center;
      margin-top: 6px;
    }
    .login {
      width: 360px;
      height: 40px;
      flex-shrink: 0;
      border-radius: 4px;
      background: #2b88fe;
      color: #fff;
      line-height: 40px;
      text-align: center;
      cursor: pointer;
      margin-top: 40px;
      transition:
        color 0.1s ease-in,
        background-color 0.1s ease-in,
        border-color 0.1s ease-in,
        width 0.2s ease-in;
      &:hover {
        background: #1a66d9;
      }
      display: flex;
      align-items: center;
      justify-content: center;
      span {
        margin-left: 4px;
      }
    }
    .loading {
      background-color: #7dbeff !important;
      cursor: not-allowed;
      img {
        animation: load-loop 1s linear infinite;
        width: 16px;
        height: 16px;
      }
    }
    .sign {
      width: 358px;
      height: 38px;
      color: #2b88fe;
      font-size: 16px;
      font-style: normal;
      font-weight: 400;
      border-radius: 4px;
      border: 1px solid #2b88fe;
      line-height: 38px;
      text-align: center;
      cursor: pointer;
      margin-top: 12px;
    }
  }
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
}
</style>
