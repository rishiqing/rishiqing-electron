import WinReg from 'winreg'

const RUN_LOCATION = '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'
const getKey = () => new WinReg({
  hive: WinReg.HKCU, //CurrentUser,
  key: RUN_LOCATION,
})

function noop(){}

const enableAutoStart = (name:string, file:string, callback?:(err: Error) => void) => {
  const key = getKey()
  key.set(name, WinReg.REG_SZ, file, callback || noop)
}

const disableAutoStart = (name:string, callback?:(err: Error) => void) => {
  const key = getKey()
  key.remove(name, callback || noop)
}

const getAutoStartValue = (name:string, callback: (value: string | null,err?: Error) => void) => {
  const key = getKey()
  key.get(name, (error, result) => {
    if (result) {
      callback(result.value)
    } else {
      callback(null, error)
    }
  })
}

export { enableAutoStart, disableAutoStart, getAutoStartValue }
