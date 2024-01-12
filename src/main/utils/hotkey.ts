import { globalShortcut } from 'electron'
import { toggleWindow } from './helper'
import store from './store'
import { eventEmitter } from './eventEmitter'
import { ViewEvent } from './eventMessage'

// 热键和方法的映射
const HotKeyFunctionMap: {
  [key: string]: () => void
} = {
  toggle: toggleWindow,
}
const configHotkey = async (config: { [key: string]: string }) =>{
  if (!config || typeof config !== 'object') return
  globalShortcut.unregisterAll()

  const registerShortcut = (k: string) => {
    globalShortcut.register(config[k], HotKeyFunctionMap[k])
    // mac系统允许注册相同的快捷键
    const isRegistered = globalShortcut.isRegistered(config[k])
    // 如果注册失败，自动再注册
    if (!isRegistered) {
      setTimeout(() => {
        registerShortcut(k)
      }, 2000)
    }
  }

  Object.keys(config).forEach((key) => {
    if (!HotKeyFunctionMap[key]) return // 如果没有对应的处理函数，则直接返回
    if (!config[key]) return
    registerShortcut(key)
  })
}

export const intiHotkey = () => {
  const key = process.platform === 'darwin' ? 'darwin' : 'win32'
  const config = store.get('hotkey')[key]
  configHotkey(config)
}

eventEmitter.on(ViewEvent.hotkeyConfigChange, () => {
  intiHotkey()
})
