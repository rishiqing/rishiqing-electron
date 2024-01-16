const { version } = require('./package.json')
const OSS = require('ali-oss')
const path = require('node:path')

const sourceList = [
  { type: 'mac', key: 'pc-autoupdate-v4/mac/check/release.json' },
  { type: 'ia32', key: 'pc-autoupdate-v4/win/ia32/check/release.json' },
  { type: 'x64', key: 'pc-autoupdate-v4/win/x64/check/release.json' },
]

const copySource = {
  mac: {
    prefix: 'pc-autoupdate-v4/mac',
    list: [
      `rishiqing-mac-release-${version}.dmg`,
      `release.json`,
      `release.yml`,
    ],
  },
  ia32: {
    prefix: 'pc-autoupdate-v4/win/ia32',
    list: [
      `rishiqing-win-ia32-release-${version}.exe`,
      `release.json`,
      `release.yml`,
    ],
  },
  x64: {
    prefix: 'pc-autoupdate-v4/win/x64',
    list: [
      `rishiqing-win-x64-release-${version}.exe`,
      `release.json`,
      `release.yml`,
    ],
  },
}

const oss = new OSS({
  accessKeyId: process.env.ALY_OSS_ACCESS_ID,
  accessKeySecret: process.env.ALY_OSS_ACCESS_KEY,
  region: 'oss-cn-shenzhen',
  bucket: 'rishiqing-client',
})

const deal = async () => {
  const infoList = await Promise.all(
    sourceList.map(async (item) => {
      let result = {}
      try {
        result = await oss.get(item.key)
      } catch (e) {}
      return {
        type: item.type,
        data: result.res ? JSON.parse(result.res.data.toString()) : {},
      }
    }),
  )

  for (let item of infoList) {
    if (item && item.data && item.data.version === version) {
      const copyDetail = copySource[item.type]
      if (!copyDetail) continue
      for (let file of copyDetail.list) {
        if (/\.json|\.yml$/.test(file)) {
          const result = path.parse(file)
          const base = result.name + '_' + new Date().getTime() + result.ext

          const beforeFilePath = path.join(copyDetail.prefix, 'release', file)
          const afterFilePath = path.join(copyDetail.prefix, 'release', base)
          try {
            await oss.head(beforeFilePath)
            await oss.copy(afterFilePath, beforeFilePath)
          } catch (e) {}
        }

        const checkFilePath = path.join(copyDetail.prefix, 'check', file)
        const releaseFilePath = path.join(copyDetail.prefix, 'release', file)
        try {
          await oss.copy(releaseFilePath, checkFilePath)
        } catch (e) {}
      }
    }
  }
}

deal()
