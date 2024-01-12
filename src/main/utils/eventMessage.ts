export enum IpcEvent {
  /** 打开日志目录 */
  'openLogDirectory' = 'open-log-directory',
  /** 获取配置项 */
  'getStoreValue' = 'get-store-value',
  /** 测试url */
  'testServer' = 'test-server',
  /** 网络错误 */
  'showNetworkError' = 'show-network-error',
  /** 获取应用地址 */
  'getAppPath' = 'get-app-path',
  /** 设置主页面地址 */
  'showUrl' = 'show-url',
  /** 获取缓存大小 */
  'getSessionSize' = 'get-session-size',
  /** 获取快捷键 */
  'getHotkey' = 'get-hotkey',
  /** 获取自启动 */
  'getAutoLaunch' = 'get-auto-launch',
  /** 设置自启动 */
  'setAutoLaunch' = 'set-auto-launch',
  /** 快捷键变动 */
  'hotkeyConfigChange' = 'hotkey-config-change',
  /** 下载位置变动 */
  'downloadConfigChange' = 'download-config-change',
  /** 打开下载设置对话框 */
  'openDownloadDialog' = 'open-download-dialog',
  /** 清理会话缓存 */
  'clearSession' = 'clear-session',
  /** 代理变动 */
  'proxyConfigChange' = 'proxy-config-change',
  /** 测试代理 */
  'testProxy' = 'test-proxy',
  /** 服务器变动 */
  'serverConfigChange' = 'server-config-change',
  /** 设置硬件加速 */
  'setDisableHardwareAcceleration' = 'set-disable-hardware-acceleration',
  /** 恢复默认 */
  'restoreDb' = 'restore-db',
  /** 打开文件 */
  'openPath' = 'open-path',
  /** 在默认资源管理器打开文件 */
  'openInFolder' = 'open-in-folder',
}

export enum ViewEvent {
  /** 设定是否强制关闭 */
  'setForceClose' = 'set-force-close',
  /** 打开开发者工具 */
  'openDevTools' = 'open-dev-tools',
  /** 回到日事清 */
  'contentBack' = 'content-back',
  /** 刷新 */
  'reload' = 'reload',
  /** 快捷键变动 */
  'hotkeyConfigChange' = 'hotkey-config-change',
  /** 代理变动 */
  'proxyConfigChange' = 'proxy-config-change',
  /** 下载位置变动 */
  'downloadConfigChange' = 'download-config-change',
}

export enum DownloadEvent {
  start = 'download-start',
  interrupted = 'download-interrupted',
  paused = 'download-paused',
  progress = 'download-progress',
  completed = 'download-completed',
  doneCancelled = 'download-done-cancelled',
  doneInterrupted = 'download-done-interrupted',
  cancelDownload = 'download-cancel-by-user',
  getList = 'get-list',
  remove = 'remove',
  removeAll = 'remove-all',
  insert = 'insert',
}
