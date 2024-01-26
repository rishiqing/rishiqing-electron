window.nodeRequire = require;
delete window.require;
delete window.exports;
delete window.module;

const { ipcRenderer } = nodeRequire('electron')
const package_json = nodeRequire('../../package.json')

const EVENTS = {
  Preload_Can_Auto_Login: 'can_auto_login',
  Preload_On_Logout: 'on_logout',
  Client_Focus: 'client_focus',
}

function dealLogin(canAutoLogin) {
  if (!canAutoLogin) {
    ipcRenderer.send(EVENTS.Preload_Can_Auto_Login, canAutoLogin)
  }
}

window.onload = () => {
  //VERSIONSTAMP
  window.VERSIONSTAMP = {
    version: package_json.version,
    time: package_json.releaseTime || new Date().toString(),
  }

  //Client_Can_Auto_Login
  let Client_Can_Auto_Login_Data = ''
  if (window.Client_Can_Auto_Login !== undefined) {
    dealLogin(window.Client_Can_Auto_Login)
  }
  Client_Can_Auto_Login_Data = window.Client_Can_Auto_Login_Data
  window.Object.defineProperty(window, 'Client_Can_Auto_Login', {
    configurable: true,
    get() {
      return Client_Can_Auto_Login_Data
    },
    set(v) {
      Client_Can_Auto_Login_Data = v
      dealLogin(v)
    },
  })

  // web端返回302,pc返回200
  window.onLogout = () => {
    ipcRenderer.send(EVENTS.Preload_On_Logout)
  }
}

ipcRenderer.on(EVENTS.Client_Focus, (_, client_focus) => {
  if (window) window.Client_Focus = client_focus
})
