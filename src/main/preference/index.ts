import Page from '../utils/page'
class Preference extends Page {
  get config() {
    return {
      title: '偏好设置',
      width: 560,
      height: 680,
    }
  }
  get loadURL() {
    if (process.argv[2]) {
      let newUrl = new URL(process.argv[2])
      newUrl.pathname = '/preference/'
      this.window && this.window.loadURL(newUrl.href)
    } else {
      this.window && this.window.loadURL('app://preference')
    }
    return ''
  }
}

export default new Preference()
