import { DownloadItem } from 'electron'

export interface proxyConfig {
  mold?: string
  host?: string
  port?: string
  username?: string
  password?: string
}

export interface DownloadFile extends DownloadItem {
  id?: number
  fileName?: string
}

export interface FileType {
  savePath: string
  itemId: number
  originUrl: string
  mimeType: string
  hasUserGesture: boolean
  fileName: string
  totalBytes: number
  receivedBytes: number
  contentDisposition: string
  urlChain: string[]
  lastModifiedTime: number
  eTag: string
  startTime: number
  _id: string
  percent: number
  completed: boolean
}

export interface StoreFileType {
  contentDisposition: string
  eTag: string
  fileName: string
  hasUserGesture: boolean
  lastModifiedTime: number
  mimeType: string
  originUrl: string
  savePath: string
  startTime: number
  endTime: number
  totalBytes: number
  urlChain: string[]
  _id: string
}
