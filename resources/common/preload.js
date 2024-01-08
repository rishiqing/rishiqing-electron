const ipc = require("electron").ipcRenderer;
const package_json = require("../../package.json");
const EVENTS = require('./preload_event')

function dealLogin(canAutoLogin) {
  if (!canAutoLogin) {
    ipc.sendToHost(EVENTS.Preload_Can_Auto_Login, canAutoLogin);
  }
}

window.onload = () => {
  //VERSIONSTAMP
  window.VERSIONSTAMP = {
    version: package_json.version,
    time: package_json.releaseTime || new Date().toString()
  };


  //Client_Can_Auto_Login
  let Client_Can_Auto_Login_Data = "";
  if (window.Client_Can_Auto_Login !== undefined) {
    dealLogin(window.Client_Can_Auto_Login);
  }
  Client_Can_Auto_Login_Data = window.Client_Can_Auto_Login_Data;
  window.Object.defineProperty(window, "Client_Can_Auto_Login", {
    configurable: true,
    get() {
      return Client_Can_Auto_Login_Data;
    },
    set(v) {
      Client_Can_Auto_Login_Data = v;
      dealLogin(v);
    }
  });

  // web端返回302,pc返回200
  window.onLogout = () => {
    ipc.sendToHost(EVENTS.Preload_On_Logout);
  };
};
