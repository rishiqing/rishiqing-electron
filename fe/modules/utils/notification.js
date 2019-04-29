import electron from 'electron'
const EVENTS = electron.remote.require('./common/notification_event')
const ipcRenderer = electron.ipcRenderer

class Notification2 extends Notification {
  constructor (title, opt) {
    opt.silent = true // 保持安静
    super(title, opt)
    this.sound()
    // 在实例化完成之后，对onclick等方法进行改造
    setTimeout(() => {
      this.replaceOnClick()
    }, 16)
    this.come()
  }

  come() {
    ipcRenderer.send(EVENTS.Notification_Come)
  }

  sound () {
    document.getElementById('notification-sound').play()
  }

  replaceOnClick () {
    if (this.onclick && typeof this.onclick === 'function') {
      const _onclick = this.onclick
      this.onclick = () => {
        ipcRenderer.send(EVENTS.Notification_Show_Window, 'show_window')
        _onclick.call(this)
      }
    } else {
      this.onclick = () => {
        ipcRenderer.send(EVENTS.Notification_Show_Window, 'show_window')
      }
    }
  }
}

export default Notification2

