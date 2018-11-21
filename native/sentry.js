const Sentry = require('@sentry/electron');
const pkg = require('../package.json');
const {ipcMain} = require('electron');
const Event = require('../common/sentry_event');

const dsn = {
  beta: 'https://d59d3b677eb5425fbc784ca4f06957d2@sentry.timetask.cn/4',
  release: 'https://074f4b34ace645c3bf3d103993152b6c@sentry.timetask.cn/5'
}

ipcMain.on(Event.Sentry_Capture_Message, (event, message) => {
  Sentry.captureMessage(message)
})

ipcMain.on(Event.Sentry_Add_Breadcrumb, (event, data) => {
  Sentry.addBreadcrumb(data)
})

exports.init = function init() {
  Sentry.init({
    dsn: pkg.env === 'release' ? dsn.release : dsn.beta,
    release: pkg.version
  })
}

exports.captureMessage = Sentry.captureMessage.bind(Sentry);

exports.captureException = Sentry.captureException.bind(Sentry);