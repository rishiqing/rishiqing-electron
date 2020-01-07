const builder = require('electron-builder');
const fs      = require('fs');
const path    = require('path');
const rimraf  = require('rimraf');
const pkg     = require('./package.json');

// zh_CN.lproj里InfoPlist.strings
const zh_CN = `
/* Localized versions of Info.plist keys */

"CFBundleDisplayName" = "日事清";
"CFBundleName" = "日事清";
`;

const output = process.platform === 'darwin' ? `package-${process.env.CHANNEL}` : `package-${process.env.ARCH}-${process.env.CHANNEL}`;

try {
  rimraf.sync(output);
} catch (e) {
  console.log(e)
}

builder.build({
  config: {
    appId: 'release.rishiqing.electron',
    productName: 'rishiqing',
    electronVersion: pkg.electronVersion,
    directories: {
      output: output,
      app: 'dir'
    },
    publish: {
      provider: 'generic',
      url: 'https://download.timetask.cn/pc-autoupdate/${os}/${env.CHANNEL}',
      channel: '${env.CHANNEL}'
    },
    mac: {
      category: 'public.app-category.productivity', //放到生产效率类
      icon: 'res/app.icns',
      type: 'distribution'
    },
    dmg: {
      artifactName: 'rishiqing-mac-${env.CHANNEL}-${version}.${ext}',
      title: '日事清 ${version}',
      contents: [
        {
          x: 30,
          y: 190
        },
        {
          x: 540 - 30 - 90 - 15 - 15,
          y: 190,
          type: 'link',
          path: '/Applications'
        }
      ]
    },
    win: {
      target: [
        {
          target: 'nsis',
          arch: [process.env.ARCH]
        }
      ],
      icon: 'res/256x256.ico',
      publish: {
        provider: 'generic',
        url: 'https://download.timetask.cn/pc-autoupdate/${os}/${env.ARCH}/${env.CHANNEL}',
        channel: '${env.CHANNEL}'
      }
    },
    nsis: {
      artifactName: 'rishiqing-win-${env.ARCH}-${env.CHANNEL}-${version}.exe',
      shortcutName: '日事清',
      uninstallDisplayName: '日事清 ${version}',
      guid: 'F4BC9A4A-E09B-465E-BC10-A8921C46E672'
    },
    afterPack: function (options) {
      if (options.electronPlatformName !== 'darwin') return null;
      return new Promise (function (resolve, reject) {
        fs.writeFile(path.join(options.appOutDir, 'rishiqing.app/Contents/Resources/zh_CN.lproj/InfoPlist.strings'), zh_CN, (err) => {
          if (err) reject(err);
          else {
            console.log('成功写入 zh_CN.lproj/InfoPlist.strings');
            resolve();
          }
        });
      });
    }
  }
});
