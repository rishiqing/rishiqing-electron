import electron from 'electron'
const EVENTS = electron.remote.require('./common/notification_event')
const ipcRenderer = electron.ipcRenderer

const NativeNotify = function (title, options){
  this.offEvents()
  this.initEvents()
  this.showNotification(title, options.body)
  this.notificationCome()
}
NativeNotify.requestPermission = () => {}
NativeNotify.permission = 'granted'

NativeNotify.prototype.showNotification = (title, content) => {
  ipcRenderer.send(EVENTS.Notification_Show_Message, { title: title, content: content })
}

NativeNotify.prototype.notificationCome = () => {
  ipcRenderer.send(EVENTS.Notification_Come)
}

NativeNotify.prototype.offEvents = () => {
  ipcRenderer.removeAllListeners(EVENTS.Notification_Show_reply)
  ipcRenderer.removeAllListeners(EVENTS.Notification_Click_reply)
  ipcRenderer.removeAllListeners(EVENTS.Notification_Close_reply)
}

NativeNotify.prototype.initEvents = () => {
  ipcRenderer.on(EVENTS.Notification_Show_reply, this.onNotificationShow.bind(this))
  ipcRenderer.on(EVENTS.Notification_Click_reply, this.onNotificationClick.bind(this))
  ipcRenderer.on(EVENTS.Notification_Close_reply, this.onNotificationClose.bind(this))
}

NativeNotify.prototype.onNotificationShow = () => {
  this.sound()
  if (this.onshow) this.onshow()
}

NativeNotify.prototype.onNotificationClick = () => {
  if (this.onclick) this.onclick()
}

NativeNotify.prototype.onNotificationClose = () => {
  if (this.onclose) this.onclose()
}

NativeNotify.prototype.sound = () => {
  document.getElementById('notification-sound').play()
}

NativeNotify.prototype.close = () => {}

export default NativeNotify