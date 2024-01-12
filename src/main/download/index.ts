import { ipcMain,app } from 'electron'
import Page from '../utils/page'
import { DownloadEvent, ViewEvent } from '../utils/eventMessage'
import path from 'node:path'
import fs from 'node:fs'
import { DownloadFile, StoreFileType } from '../../types'
import store, { downloadData } from '../utils/store'
import crypto from 'node:crypto'
import { eventEmitter } from '../utils/eventEmitter'

let downloadIdCount = 0

const downloadItemIdMap = new Map<number, DownloadFile>() // 缓存下载对象和itemId之间的映射关系
const downloadFileNameMap = new Map<string, boolean>() // 缓存正在现在的文件名，防止某些文件还没下载完成，又下载同一文件名的文件

let downloadPath = '' // 下载路径

export const isExist = (p: string) => {
  let stat = {}
  try {
    stat = fs.statSync(p)
  } catch (e) {
    return false
  }
  return stat
}

const getDownloadPath = async() => {
  const config = store.get('downloadConfig')
  if (config) {
    // 是否每次都需要询问下载路径
    if (config.inquiryDownloadPath) {
      return;
    }
    if (config.downloadPath && isExist(config.downloadPath)) {
      return config.downloadPath;
    }
  }
  let defaultPath = '';
  try {
    defaultPath = app.getPath('downloads')
  } catch(e) {
    // 无法获取默认的下载路径
  }

  if (defaultPath) return defaultPath;
}

// 初始化通用配置
async function initCommonConfig() {
  downloadPath = await getDownloadPath() || ''
  // 在保存路径发生变化的时候，重置一下
  eventEmitter.on(ViewEvent.downloadConfigChange, async () =>  {
    downloadPath = await getDownloadPath() || ''
  })
}

initCommonConfig();

const uid = (len: number) => {
  return crypto
    .randomBytes(Math.ceil(Math.max(8, len * 2)))
    .toString('base64')
    .replace(/[+\/]/g, '')
    .slice(0, len)
}

const createUid = (list: StoreFileType[]): string => {
  let id = uid(16)
  if (list.find((i) => i._id === id)) {
    return createUid(list)
  }
  return id
}



class Download extends Page {
  get config() {
    return {
      title: '下载管理',
    }
  }
  get loadURL() {
    if (process.argv[2]) {
      let newUrl = new URL(process.argv[2])
      newUrl.pathname = '/download/'
      this.window && this.window.loadURL(newUrl.href)
    } else {
      this.window && this.window.loadURL('app://download')
    }
    return ''
  }

  constructor() {
    super()
    ipcMain.on(DownloadEvent.cancelDownload, (_, itemId) =>
      this.onCancelItem(itemId),
    )
    ipcMain.handle(DownloadEvent.getList, () => {
      const list = [...downloadData.get('list')]
      return list.sort((a, b) => b.endTime - a.endTime)
    })

    ipcMain.on(DownloadEvent.remove, (_, id) => {
      const list = downloadData.get('list')
      const res = list.findIndex((i) => i._id === id)
      if (res > -1) {
        list.splice(res, 1)
      }
      downloadData.set('list', list)
    })
    ipcMain.on(DownloadEvent.removeAll, () => {
      downloadData.clear()
    })
    ipcMain.handle(DownloadEvent.insert, (_, file) => {
      const list = downloadData.get('list')
      let id = createUid(list)
      const obj = {
        contentDisposition: file.contentDisposition,
        eTag: file.eTag,
        fileName: file.fileName,
        hasUserGesture: file.hasUserGesture,
        lastModifiedTime: file.lastModifiedTime,
        mimeType: file.mimeType,
        originUrl: file.originUrl,
        savePath: file.savePath,
        startTime: file.startTime,
        endTime: new Date().getTime(),
        totalBytes: file.totalBytes,
        urlChain: file.urlChain,
        _id: id,
      }
      list.push(obj)
      downloadData.set('list', list)
      return obj
    })
  }

  onCancelItem(itemId: number) {
    const item = downloadItemIdMap.get(itemId)
    if (item) item.cancel()
  }

  startDownload(item: DownloadFile) {
    if (!downloadPath) return
    if (!isExist(downloadPath)) return
    const fileName = this.generateDownloadFileName(item.getFilename())
    item.setSavePath(path.join(downloadPath, fileName))
    item.id = ++downloadIdCount
    item.fileName = fileName
    downloadItemIdMap.set(item.id, item)
    downloadFileNameMap.set(fileName, true)
    this.open()
    const webContents = this.window && this.window.webContents
    if (!webContents) return
    webContents.send(DownloadEvent.start, {
      savePath: item.getSavePath(),
      itemId: item.id,
      originUrl: item.getURL(),
      mimeType: item.getMimeType(),
      hasUserGesture: item.hasUserGesture(),
      fileName: fileName,
      totalBytes: item.getTotalBytes(),
      receivedBytes: item.getReceivedBytes(),
      contentDisposition: item.getContentDisposition(),
      urlChain: item.getURLChain(),
      lastModifiedTime: item.getLastModifiedTime(),
      eTag: item.getETag(),
      startTime: item.getStartTime(),
    })
    item.on('updated', (_, state) => {
      if (state === 'interrupted') {
        webContents.send(DownloadEvent.interrupted, {
          itemId: item.id,
        })
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          webContents.send(DownloadEvent.paused, {
            itemId: item.id,
          })
        } else {
          webContents.send(DownloadEvent.progress, {
            itemId: item.id,
            totalBytes: item.getTotalBytes(),
            receivedBytes: item.getReceivedBytes(),
          })
        }
      }
    })
    item.once('done', (_, state) => {
      if (state === 'completed') {
        webContents.send(DownloadEvent.completed, {
          itemId: item.id,
        })
      } else if (state === 'cancelled') {
        webContents.send(DownloadEvent.doneCancelled, {
          itemId: item.id,
        })
      } else if (state === 'interrupted') {
        webContents.send(DownloadEvent.doneInterrupted, {
          itemId: item.id,
        })
      }
      if (item.id !== undefined) downloadItemIdMap.delete(item.id)
      if (item.fileName !== undefined) downloadFileNameMap.delete(item.fileName)
    })
  }
  generateDownloadFileName(fileName: string) {
    let isExist = this.isFileExist(fileName)
    if (!isExist) return fileName
    const extname = path.extname(fileName)
    const basename = path.basename(fileName, extname)

    let count = 0

    while (isExist) {
      isExist = this.isFileExist(`${basename}(${++count})${extname}`)
    }
    return `${basename}(${count})${extname}`
  }

  isFileExist(fileName: string) {
    const p = path.join(downloadPath, fileName)
    return isExist(p) || downloadFileNameMap.get(fileName)
  }
}

export default new Download()
