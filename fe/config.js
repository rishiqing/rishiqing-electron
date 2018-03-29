;(function(){
  var package = require('../package.json');
  var env = package.env;//dev是开发环境，release是发布环境, beta是beta环境
  var PREFIX_URL = {
    dev:"http://beta.rishiqing.com",
    beta:"http://beta.rishiqing.com",
    debug: "http://beta.rishiqing.com",
    release:"https://www.rishiqing.com",
    demo:"http://192.168.1.106"
  }
  var INTERCEPT_SCHEME = {
    dev:"http",
    beta:"http",
    release:"https",
    demo:"http"
  }
  var IP = {
    dev: "182.92.10.95",
    beta: "182.92.10.95",
    release: "182.92.1.117",
    demo: "192.168.1.106"
  };
  //获取版本号的链接
  var VERSIONURL = PREFIX_URL[env] + '/task/deskAppVersion/getLastVersionApp';
  var DOWNLOADURL = PREFIX_URL[env] + '/client';
  var BASE_URL = PREFIX_URL[env] + '/task';
  var LOGOUT_URL = PREFIX_URL[env] + '/task/logout/index';
  var ACCOUNT_URL = PREFIX_URL[env] + '/i';

  var WEBSITE = PREFIX_URL[env] + '/';
  var exportsJson = {
    ENV:env,
    BASE_URL:BASE_URL,
    LOGOUT_URL:LOGOUT_URL,
    INTERCEPT_SCHEME:INTERCEPT_SCHEME[env],
    weixinOauthUrl:"open.weixin.qq.com",
    qqOauthUrl:"openapi.qzone.qq.com",
    sinaOauthUrl:"api.weibo.com",
    ddOauthUrl: "oapi.dingtalk.com",
    WEBSITE:WEBSITE,
    isOauthPage:function(pageUrl){
      if(pageUrl.indexOf(this.weixinOauthUrl) != -1 ){
        return true;
      }
      if(pageUrl.indexOf(this.qqOauthUrl) != -1){
        return true;
      }
      if(pageUrl.indexOf(this.sinaOauthUrl) != -1){
        return true;
      }
      if (pageUrl.indexOf(this.ddOauthUrl) != -1) {
        return true;
      }
      return false;
    },
    MIN_WINDOW_WIDTH: package.MIN_WINDOW_WIDTH,//1208
    MIN_WINDOW_HEIGHT: package.MIN_WINDOW_HEIGHT,
    VERSION: package.version,
    VERSIONURL:VERSIONURL,
    DOWNLOADURL:DOWNLOADURL,
    ACCOUNT_URL:ACCOUNT_URL,
    IP: IP[env],
    THIRD_LOGIN_HOST: {
      'open.weixin.qq.com': '微信',
      'graph.qq.com'      : 'QQ',
      'api.weibo.com'     : '微博',
      'oapi.dingtalk.com' : '钉钉'
    }
  }

  try{
    module.exports = exportsJson
  }catch(e){
    for(var index in exportsJson){
      window[index] = exportsJson[index];
    }
  }
})();
