<script setup lang="ts">
import { ipcRenderer } from 'electron'
import { watch, ref, onBeforeMount } from 'vue'
import RSwitch from '../component/RSwitch.vue'
import RHotkey from '../component/RHotkey.vue'
import RDownload from '../component/RDownload.vue'
import RCache from '../component/RCache.vue'
import RProxy from '../component/RProxy.vue'
import RServer from '../component/RServer.vue'
import { IpcEvent } from '../../main/utils/eventMessage'
const defaultPort: {
  [key: string]: string
} = {
  http: '80',
  https: '443',
  socks4: '1080',
  socks5: '1080',
}
defineOptions({
  name: 'Preference',
})

const isAutoLaunch = ref(false)

const hotkey = ref<{
  toggle: string
}>({
  toggle: '',
})
const cacheSize = ref(0)
const proxyConfig = ref<{
  mold: string
  host: string
  port: string
  username: string
  password: string
}>({
  mold: 'none',
  host: '',
  port: '',
  username: '',
  password: '',
})

const serverConfig = ref({
  enablePrivate: false,
  privateUrl: '',
  privateBaseUrl: '',
  officialUrl: '',
  officialBaseUrl: '',
})

const downloadConfig = ref({
  inquiryDownloadPath: false,
  downloadPath: '',
})

const disableHardwareAcceleration = ref(false)

const init = async () => {
  cacheSize.value = await ipcRenderer.invoke(IpcEvent.getSessionSize)
  proxyConfig.value = await ipcRenderer.invoke(
    IpcEvent.getStoreValue,
    'proxyConfig',
  )
  serverConfig.value = await ipcRenderer.invoke(
    IpcEvent.getStoreValue,
    'serverConfig',
  )
  downloadConfig.value = await ipcRenderer.invoke(
    IpcEvent.getStoreValue,
    'downloadConfig',
  )

  hotkey.value = await ipcRenderer.invoke(IpcEvent.getHotkey)

  isAutoLaunch.value = await ipcRenderer.invoke(IpcEvent.getAutoLaunch)

  disableHardwareAcceleration.value = !(await ipcRenderer.invoke(
    IpcEvent.getStoreValue,
    'disableHardwareAcceleration',
  ))

}


onBeforeMount(async () => {
  await init()
  // 数据填充后才能做修改
  watch(
    () => isAutoLaunch.value,
    (value) => {
      ipcRenderer.invoke(IpcEvent.setAutoLaunch, value)
    },
    { deep: true },
  )

  watch(
    () => hotkey.value,
    (value) => {
      ipcRenderer.send(IpcEvent.hotkeyConfigChange, { ...value })
    },
    { deep: true },
  )

  watch(
    () => downloadConfig.value,
    (value) => {
      ipcRenderer.send(IpcEvent.downloadConfigChange, { ...value })
    },
    { deep: true },
  )

  watch(
    () => proxyConfig.value,
    async (value) => {
      let port = value.port
      if (!port) {
        port = defaultPort[value.mold]
      }
      if (value.mold === 'socks4' || value.mold === 'socks5') {
        proxyConfig.value.password = ''
        proxyConfig.value.username = ''
      }
      if (value.mold === 'none') {
        proxyConfig.value.host = ''
        proxyConfig.value.port = ''
        proxyConfig.value.username = ''
        proxyConfig.value.password = ''
      }
      await ipcRenderer.send(IpcEvent.proxyConfigChange, {
        ...proxyConfig.value,
        port,
      })
    },
    { deep: true },
  )

  watch(
    () => serverConfig.value,
    (value) => {
      if (!value.enablePrivate) {
        serverConfig.value.privateBaseUrl = ''
        serverConfig.value.privateUrl = ''
      }
      ipcRenderer.send(IpcEvent.serverConfigChange, { ...serverConfig.value })
    },
    { deep: true },
  )

  watch(
    () => disableHardwareAcceleration.value,
    (value) => {
      ipcRenderer.send(IpcEvent.setDisableHardwareAcceleration, !value)
    },
    { deep: true },
  )
})

const onDownloadChange = async () => {
  const file = await ipcRenderer.invoke(IpcEvent.openDownloadDialog, {
    ...downloadConfig.value,
  })
  downloadConfig.value.downloadPath = file.filePaths[0]
  ipcRenderer.send(IpcEvent.downloadConfigChange, {
    ...downloadConfig.value,
  })
}

const onSessionClear = () => {
  ipcRenderer.send(IpcEvent.clearSession)
}

const openLog = () => {
  ipcRenderer.send(IpcEvent.openLogDirectory)
}

const onTest = () => {
  ipcRenderer.send(IpcEvent.testProxy)
}

const onRestore = async() => {
  await ipcRenderer.invoke(IpcEvent.setAutoLaunch, false)
  await ipcRenderer.invoke(IpcEvent.restoreDb)
  await init()
}
</script>

<template>
  <div class="preference">
    <div class="section">
      <div class="item">
        <span class="name">开机自启动</span>
        <RSwitch v-model="isAutoLaunch" />
      </div>
    </div>
    <RHotkey v-model="hotkey" />
    <RDownload v-model="downloadConfig" @change="onDownloadChange" />
    <RCache v-model="cacheSize" @clear="onSessionClear" />
    <RProxy v-model="proxyConfig" @test-click="onTest" />
    <RServer v-model="serverConfig" />
    <div class="section">
      <div class="item">
        <span class="name">开启硬件加速（重启生效，win7默认关闭）</span>
        <RSwitch v-model="disableHardwareAcceleration" />
      </div>
    </div>
    <div class="section">
      <div class="item log">
        <button @click="openLog">打开日志文件夹</button>
      </div>
    </div>
    <div class="section restore-setting">
      <div class="content">
        <button @click="onRestore" title="恢复默认设置">恢复设置</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.preference {
  padding: 0 40px;
  .hide {
    display: none !important;
  }

  $section: '.section';
  #{$section} {
    & + #{$section} {
      border-top: 1px solid #e0e0e0;
    }

    padding: 28px 0;

    .title {
      font-size: 13px;
      color: #b1b1b1;
    }

    .content {
      padding-top: 20px;
    }

    .item,
    .item-half {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .name {
        font-size: 14px;
        color: #3b3b3b;
      }

      > input[type='text'],
      > input[type='password'],
      > input[type='text'][readonly],
      > input[type='password'][readonly] {
        height: 30px;
        border-radius: 15px;
        border: 1px solid #ddd;
        padding: 0 15px;
        width: 148px;
        outline: none;

        &[readonly] {
          background-color: #f7f7f7;
          cursor: default;
        }
      }

      > select {
        -webkit-appearance: none;
        height: 30px;
        outline: none;
        width: 148px;
        background: none;
        border: 1px solid #ddd;
        border-radius: 15px;
        font-size: 12px;
        color: #8c8c8c;
        padding: 0 15px;
        background: url(../assets/arrow.png) no-repeat scroll 124px center
          transparent;
      }
      &.private-server input {
        width: 260px !important;
      }

      &.download-path .r-input {
        width: 260px;
      }

      &.proxy-test button {
        width: 48px;
        height: 30px;
        background: #6bc859;
        border-radius: 15px;
        border: none;
        color: #fff;
        outline: none;
        cursor: pointer;
        font-size: 12px;
      }
      &.log button {
        width: 200px;
        height: 30px;
        background: #6bc859;
        border-radius: 15px;
        border: none;
        color: #fff;
        outline: none;
        cursor: pointer;
        font-size: 12px;
      }
    }

    .item + .item {
      margin-top: 12px;
    }

    & .item-half {
      width: 216px;
    }

    &.restore-setting {
      padding-top: 0px;

      .content {
        text-align: center;

        button {
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

          &:hover {
            color: #3b3b3b;
          }
        }
      }
    }
  }
}
</style>
