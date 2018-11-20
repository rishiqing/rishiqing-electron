const Sentry = require('@sentry/node');
const pkg = require('../package.json');
const {ipcMain} = require('electron');
const Event = require('../common/sentry_event');

ipcMain.on(Event.Sentry_Capture_Message, (event, message) => {
  Sentry.captureMessage(message)
})

ipcMain.on(Event.Sentry_Add_Breadcrumb, (event, data) => {
  Sentry.addBreadcrumb(data)
})

exports.init = function init() {
  Sentry.init({
    dsn: 'https://d59d3b677eb5425fbc784ca4f06957d2@sentry.timetask.cn/4',
    release: pkg.version
  })
}