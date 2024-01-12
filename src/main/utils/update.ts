import { Notification } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log/main'
const setAutoUpdate = () => {
  autoUpdater.on('update-downloaded', (info) => {
    const notify = new Notification({
      title: `日事清V${info.version} 已准备就绪！`,
      body: `请退出当前应用，以便完成更新！`,
    })
    notify.show()
  })
  autoUpdater.on('error', (error) => {
    const notify = new Notification({
      title: '日事清PC端自动更新出错了!!!',
      body: error.message,
    })
    log.error(error.message)
    notify.show()
  })
  autoUpdater.checkForUpdates()
}

export default setAutoUpdate
