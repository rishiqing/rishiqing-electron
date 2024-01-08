import Store from 'electron-store'
import log from 'electron-log/main'

const store = new Store({
  name: 'setting',
  defaults: {
    windowSize: {
      width: 1218,
      height: 630,
    },
    'server-config': {
      enablePrivate: false,
      privateUrl: '',
      officialUrl :'https://www.rishiqing.com',
    },
  },
})
log.info('store initialize')

export default store
