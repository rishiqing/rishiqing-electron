const { notarize } = require('@electron/notarize')
const path = require('node:path')

const {
  XCODE_APP_LOADER_EMAIL,
  XCODE_APP_LOADER_PASSWORD,
  XCODE_APP_LOADER_TEAM_ID,
  CHANNEL,
} = process.env

const main = async (context) => {
  const { electronPlatformName, appOutDir } = context

  if (
    electronPlatformName !== 'darwin' ||
    !XCODE_APP_LOADER_EMAIL ||
    !XCODE_APP_LOADER_PASSWORD ||
    !XCODE_APP_LOADER_TEAM_ID ||
    CHANNEL === 'beta'
  ) {
    console.log('跳过签名')
    return
  }

  console.log('Starting Apple notarization.')
  await notarize({
    appBundleId: 'release.rishiqing.electron',
    appPath: path.join(appOutDir, 'rishiqing.app'),
    appleId: XCODE_APP_LOADER_EMAIL,
    appleIdPassword: XCODE_APP_LOADER_PASSWORD,
    teamId: XCODE_APP_LOADER_TEAM_ID,
  })

  console.log('签名结束')
}

exports.default = main
