<script setup lang="ts">
import url from 'url'
import { ipcRenderer } from 'electron'

const emit = defineEmits(['display', 'setUrl'])

const getUrl = async () => {
  const serverConfig = await ipcRenderer.invoke(
    'get-store-value',
    'server-config',
  )
  let serverUrl = ''
  if (serverConfig.enablePrivate) {
    serverUrl = serverConfig.privateUrl
  } else {
    serverUrl = serverConfig.officialUrl
  }
  return serverUrl
}

const login = async () => {
  const baseUrl = await getUrl()
  return url.resolve(baseUrl, '/account/login')
}

const sign = async () => {
  const baseUrl = await getUrl()
  return url.resolve(baseUrl, '/account/register')
}

const openUrl = async (type: 'login' | 'sign') => {
  let url
  if (type === 'login') {
    url = await login()
  } else {
    url = await sign()
  }
  if (url) {
    const result = await ipcRenderer.invoke('test-server', url)
    if (result.alive) {
      emit('display', false)
      emit('setUrl', url)
    } else {
      ipcRenderer.send('show-network-error', result.message)
    }
  } else {
    ipcRenderer.send('show-network-error', '自定义服务器不可用')
  }
}
</script>

<template>
  <div class="welcome">
    <img src="../../assets/welcome.png" draggable="false" />
    <div class="main">
      <img src="../../../resources/img/rishiqing.png" draggable="false" />
      <span>欢迎使用日事清！</span>
      <div class="login" @click="openUrl('login')">登录</div>
      <div class="sign" @click="openUrl('sign')">注册</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
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
    span {
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
</style>
