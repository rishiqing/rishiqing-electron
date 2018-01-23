/*
* @Author: qinyang
* @Date:   2018-01-22 10:24:45
* @Last Modified by:   qinyang
* @Last Modified time: 2018-01-22 15:23:19
* @for: remote copy to aliyun oss
*/
const pkg  = require('./package.json');
const OSS  = require('aliyun-sdk').OSS;
const path = require('path');

const sourceList = [
  { type: 'mac', key: 'pc-autoupdate/mac/check/release-mac.json' },
  { type: 'ia32', key: 'pc-autoupdate/win/ia32/check/release.json' },
  { type: 'x64', key: 'pc-autoupdate/win/x64/check/release.json' }
];

const copySource = {
  mac: {
    prefix: 'pc-autoupdate/mac',
    list: [
      `rishiqing-${pkg.version}-mac.zip`,
      `rishiqing-mac-release-${pkg.version}.dmg`,
      `release-mac.json`,
      `release-mac.yml`
    ]
  },
  ia32: {
    prefix: 'pc-autoupdate/win/ia32',
    list: [
      `rishiqing-win-ia32-release-${pkg.version}.exe`,
      `release.json`,
      `release.yml`
    ]
  },
  x64: {
    prefix: 'pc-autoupdate/win/x64',
    list: [
      `rishiqing-win-x64-release-${pkg.version}.exe`,
      `release.json`,
      `release.yml`
    ]
  }
};

const oss = new OSS({
  'accessKeyId': process.env.ALY_OSS_Access_Id,
  'secretAccessKey': process.env.ALY_OSS_Access_Key,
  'endpoint': 'http://oss-cn-shenzhen.aliyuncs.com',
  'apiVersion': '2013-10-15'
});

const copyObject = function (obj) {
  return new Promise(function (resolve, reject) {
    oss.copyObject(Object.assign({
      Bucket: 'rishiqing-client'
    }, obj), function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

const getObject = function (obj) {
  return new Promise(function (resolve, reject) {
    oss.getObject(Object.assign({
      Bucket: 'rishiqing-client'
    }, obj), function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

const deal = async function () {
  const infoList = [];
  for (let item of sourceList) {
    try {
      const result = await getObject({
        Key: item.key
      });
      infoList.push({
        type: item.type,
        data: JSON.parse(result.Body.toString())
      });
    } catch (e) {}
  }

  for (let item of infoList) {
    if (item && item.data && item.data.version === pkg.version) {
      const copyDetail = copySource[item.type];
      for (let file of copyDetail.list) {
        if (/\.json|\.yml$/.test(file)) {
          const result = path.parse(file);
          const base = result.name + '_' + (new Date()).getTime() + result.ext
          await copyObject({
            CopySource: path.join('/rishiqing-client', copyDetail.prefix, 'release', file),
            Key: path.join(copyDetail.prefix, 'release', base) // 这个地方不能以 '/' 开头，不然会报签名错误
          });
        }
        await copyObject({
          CopySource: path.join('/rishiqing-client', copyDetail.prefix, 'check', file),
          Key: path.join(copyDetail.prefix, 'release', file)
        });
      }
    }
  }
}

deal();


