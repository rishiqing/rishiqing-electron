import { app } from 'electron'

export const autoLaunchIsEnabled = () => {
  const setting = app.getLoginItemSettings()
  return setting.openAtLogin
}

export const autoLaunchEnable = () => {
  app.setLoginItemSettings({
    openAtLogin: true,
  })
}

export const autoLaunchDisable = () => {
  app.setLoginItemSettings({
    openAtLogin: false,
  })
}
