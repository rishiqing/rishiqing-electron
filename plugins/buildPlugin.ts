import path from 'node:path'
import fs from 'node:fs'
import { build, Platform, type CliOptions } from 'electron-builder'
import esbuild from 'esbuild'
import fsExtra from 'fs-extra'
import { preparePackageJson } from './utils'

// 根路径是cwd

const zh_CN = `
/* Localized versions of Info.plist keys */
    
"CFBundleDisplayName" = "日事清";
"CFBundleName" = "日事清";
`

const createBuilderOptions = (platform = 'win'): CliOptions => {
  let targets
  let output = `package-${process.env.CHANNEL}`
  if (platform === 'win') {
    targets = Platform.WINDOWS.createTarget()
    output = `package-win-${process.env.CHANNEL}`
  }
  if (platform === 'mac') {
    targets = Platform.MAC.createTarget()
    output = `package-mac-${process.env.CHANNEL}`
  }
  if (platform === 'linux') {
    targets = Platform.LINUX.createTarget()
    output = `package-linux-${process.env.CHANNEL}`
  }
  return {
    config: {
      directories: {
        output,
        app: path.join(process.cwd(), 'dist'),
      },
      publish: [
        {
          provider: 'github',
          owner: 'rishiqing',
          repo: 'rishiqing-electron',
        },
        {
          provider: 'generic',
          url: 'https://download.timetask.cn/pc-autoupdate/${os}/${env.CHANNEL}',
          channel: '${env.CHANNEL}',
        },
      ],
      productName: 'rishiqing',
      appId: 'release.rishiqing.electron',
      mac: {
        category: 'public.app-category.productivity', //放到生产效率类
        icon: 'resources/img/rishiqing.icns',
        type: 'distribution',
        target: {
          arch: 'universal',
          target: 'dmg',
        },
      },
      dmg: {
        artifactName: 'rishiqing-mac-${env.CHANNEL}-${version}.${ext}',
        title: '日事清 ${version}',
        contents: [
          {
            x: 30,
            y: 190,
          },
          {
            x: 540 - 30 - 90 - 15 - 15,
            y: 190,
            type: 'link',
            path: '/Applications',
          },
        ],
        background: 'resources/img/background.png',
      },
      win: {
        target: [
          {
            target: 'nsis',
            arch: ['x64', 'ia32'],
          },
        ],
        icon: 'resources/img/rishiqing.ico',
        publish: {
          provider: 'generic',
          url: "https://download.timetask.cn/pc-autoupdate/${os}/${arch}/${env.CHANNEL}',",
          channel: '${env.CHANNEL}',
        },
      },
      linux: {
        target: {
          target: 'deb',
          arch: 'arm64',
        },
      },
      nsis: {
        artifactName: 'rishiqing-win-${arch}-${env.CHANNEL}-${version}.exe',
        shortcutName: '日事清',
        uninstallDisplayName: '日事清 ${version}',
        guid: 'F4BC9A4A-E09B-465E-BC10-A8921C46E672',
        include: 'resources/common/installer.nsh',
      },
      afterPack(options) {
        if (options.electronPlatformName !== 'darwin') return null
        const infoPlistPath = path.join(
          options.appOutDir,
          'rishiqing.app/Contents/Resources/zh_CN.lproj/InfoPlist.strings',
        )
        try {
          fs.writeFileSync(infoPlistPath, zh_CN)
          console.log('成功写入 zh_CN.lproj/InfoPlist.strings')
        } catch (err) {
          console.error('写入文件时出错:', err)
        }
      },
    },
    targets,
  }
}

const buildMain = () => {
  esbuild.buildSync({
    entryPoints: ['./src/main/mainEntry.ts'],
    bundle: true,
    platform: 'node',
    minify: true,
    outfile: './dist/mainEntry.js',
    external: ['electron'],
  })
  // 把res的复制到dist
  fsExtra.copySync('./resources', './dist/resources')
}

const buildInstaller = async () => {
  // win
  await build(createBuilderOptions('win'))
  // mac
  await build(createBuilderOptions('mac'))
  // linux
  await build(createBuilderOptions('linux'))
}

export function buildPlugin() {
  return {
    name: 'build-plugin',
    closeBundle: () => {
      buildMain()
      preparePackageJson()
      buildInstaller()
    },
  }
}
