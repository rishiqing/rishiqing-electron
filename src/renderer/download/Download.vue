<script setup lang="ts">
import { FileType } from '../../types'
import RDownloadItem from '../component/RDownloadItem.vue'
import { getFileSmallImage } from '../utils/file'
import { ipcRenderer } from 'electron'
import { DownloadEvent, IpcEvent } from '../../main/utils/eventMessage.js'
import { ref, onBeforeMount } from 'vue'
import _ from 'lodash-es'

const downloadingList = ref<FileType[]>([]) // 用来缓存正在下载的文件列表信息
const downloadedList = ref<FileType[]>([]) // 用来缓存已经下载的文件列表信息

const findItemById = (itemId: number) => {
  return _.find(downloadingList.value, { itemId })
}

const removeItemById = (itemId: number) => {
  const index = _.findIndex(downloadingList.value, { itemId })
  if (index > -1) downloadingList.value.splice(index, 1)
}

const removeItemInDownLoadedList = (_id: string) => {
  const index = _.findIndex(downloadedList.value, { _id })
  if (index > -1) downloadedList.value.splice(index, 1)
}

const onStart = (file: FileType) => {
  file.percent = 0
  file.completed = false
  downloadingList.value.unshift(file)
}

const onProgress = (progress: {
  itemId: number
  totalBytes: number
  receivedBytes: number
}) => {
  const file = findItemById(progress.itemId)
  if (file) {
    file.totalBytes = progress.totalBytes
    file.receivedBytes = progress.receivedBytes
    file.percent = Math.ceil((file.receivedBytes / file.totalBytes) * 100)
  }
}
const onCompleted = async (data: FileType) => {
  const file = findItemById(data.itemId)
  if (file) {
    file.completed = true
    removeItemById(file.itemId)
    const newFile = await ipcRenderer.invoke(
      DownloadEvent.insert,
      _.cloneDeep(file),
    )
    downloadedList.value.unshift(newFile)
  }
}
ipcRenderer.on(DownloadEvent.start, (_, file) => {
  onStart(file)
})
ipcRenderer.on(DownloadEvent.progress, (_, progress) => {
  onProgress(progress)
})
ipcRenderer.on(DownloadEvent.completed, (_, data) => {
  onCompleted(data)
})

const getFileTypeImageUrl = (file: FileType) => {
  const type = getFileSmallImage(file.fileName)
  return `/file/${type}_2x.png`
}

const openItem = (file: FileType) => {
  // shell.openPath(file.savePath)
  ipcRenderer.send(IpcEvent.openPath, file.savePath)
}
const openInFolder = (file: FileType) => {
  // shell.showItemInFolder(file.savePath)
  ipcRenderer.send(IpcEvent.openInFolder, file.savePath)
}
const cancel = (file: FileType) => {
  removeItemById(file.itemId)
  ipcRenderer.send(DownloadEvent.cancelDownload, file.itemId)
}
const clear = (file: FileType) => {
  removeItemInDownLoadedList(file._id)
  ipcRenderer.send(DownloadEvent.remove, file._id)
}
const clearAll = () => {
  downloadedList.value.splice(0)
  ipcRenderer.send(DownloadEvent.removeAll)
}

onBeforeMount(async () => {
  const list = await ipcRenderer.invoke(DownloadEvent.getList)
  list.forEach((item: FileType) => downloadedList.value.push(item))
})
</script>

<template>
  <div class="download">
    <div class="list">
      <ul>
        <RDownloadItem
          v-for="file in downloadingList"
          :key="file.itemId"
          :file="file"
          :downloaded="false"
          :file-type-image-url="getFileTypeImageUrl(file)"
          :cancel="cancel"
        />
        <RDownloadItem
          v-for="file in downloadedList"
          :key="file.itemId"
          :file="file"
          :downloaded="true"
          :file-type-image-url="getFileTypeImageUrl(file)"
          :open-item="openItem"
          :open-in-folder="openInFolder"
          :clear="clear"
        />
      </ul>
    </div>
    <div class="footer">
      <a class="clear-all" @click="clearAll()">清除全部记录</a>
    </div>
  </div>
</template>

<style lang="scss">
.download {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;

  .list {
    height: calc(100% - 40px);
    overflow: auto;
    overflow-x: hidden;

    ul {
      padding: 24px 20px 0 20px;
    }

    .download-item + .download-item {
      margin-top: 27px;
    }
  }

  .footer {
    height: 40px;
    border-top: 1px solid #eaeaea;
    display: flex;
    align-items: center;
    justify-content: center;

    > a {
      font-size: 12px;
      color: #0689dd;
      cursor: pointer;
    }
  }

  .download-item {
    display: flex;
    align-items: center;
    height: 28px;

    > img {
      width: 24px;
      height: 28px;
    }

    .info {
      flex: auto;
      height: 100%;
      flex-direction: column;
      justify-content: space-between;
      display: flex;
      padding-left: 16px;
      max-width: 208px;

      .name {
        font-size: 13px;
        color: #3d3d3d;
        line-height: 1;
        white-space: nowrap;
        overflow: hidden;
        max-width: 199px;
        text-overflow: ellipsis;
      }

      .open {
        font-size: 12px;
        color: #6bc859;
        line-height: 1;

        a + a {
          margin-left: 16px;
        }

        > a {
          cursor: pointer;
        }
      }

      .progress {
        width: 102px;
        height: 6px;
        border-radius: 3px;
        background: #efefef;
        position: relative;

        .progress-bar {
          height: 100%;
          width: 0;
          background: #5bbbfc;
          border-radius: 3px;
        }

        .percent {
          font-size: 12px;
          position: absolute;
          right: -3em;
          top: -3px;
          line-height: 1;
          color: #1ba4ff;
        }
      }
    }
    .size {
      font-size: 12px;
      color: #666;
      white-space: nowrap;
      width: 5em;
      text-align: right;
    }

    .operate {
      padding-left: 20px;
      cursor: pointer;
      white-space: nowrap;

      .cancel {
        font-size: 12px;
        color: #0689dd;
      }

      .clear {
        font-size: 12px;
        color: #9b9b9b;
      }
    }
  }
}
</style>
