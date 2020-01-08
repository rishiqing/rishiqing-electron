import electron from 'electron'
const package_json        = electron.remote.require('./package.json')
const env = package_json.env//dev是开发环境，release是发布环境, beta是beta环境
const PREFIX_URL = {
  dev: 'https://beta.rishiqing.com',
  beta: 'https://beta.rishiqing.com',
  debug: 'https://beta.rishiqing.com',
  release: 'https://www.rishiqing.com',
}

const WEBSITE = PREFIX_URL[env] + '/'
const exportsJson = {
  weixinOauthUrl: 'open.weixin.qq.com',
  qywxOauthUrl: 'open.work.weixin.qq.com',
  WEBSITE: WEBSITE,
  THIRD_LOGIN_HOST: {
    'open.weixin.qq.com': '微信',
    'graph.qq.com'      : 'QQ',
    'api.weibo.com'     : '微博',
    'oapi.dingtalk.com' : '钉钉',
    'open.work.weixin.qq.com': '企业微信'
  }
}

export default exportsJson
