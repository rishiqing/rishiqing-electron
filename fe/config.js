var package = require('../package.json');
var env = package.env;//dev是开发环境，release是发布环境, beta是beta环境
var PREFIX_URL = {
  dev:"http://beta.rishiqing.com",
  beta:"http://beta.rishiqing.com",
  debug: "http://beta.rishiqing.com",
  release:"https://www.rishiqing.com",
}

var WEBSITE = PREFIX_URL[env] + '/';
var exportsJson = {
  weixinOauthUrl: "open.weixin.qq.com",
  WEBSITE: WEBSITE,
  THIRD_LOGIN_HOST: {
    'open.weixin.qq.com': '微信',
    'graph.qq.com'      : 'QQ',
    'api.weibo.com'     : '微博',
    'oapi.dingtalk.com' : '钉钉'
  }
}

module.exports = exportsJson