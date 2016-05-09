;(function(){
  var env = "dev";//dev是开发环境，release是发布环境
  //当前版本号
  var VERSION = {
    dev:2.0,
    release:2.0,
    demo:1.3
  }
  var PREFIX_URL = {
    dev:"http://beta.rishiqing.com",
    release:"https://www.rishiqing.com",
    demo:"http://192.168.1.106"
  }
  var INTERCEPT_SCHEME = {
    dev:"http",
    release:"https",
    demo:"http"
  }
  //获取版本号的链接
  var VERSIONURL = PREFIX_URL[env] + '/task/deskAppVersion/getLastVersionApp';
  var DOWNLOADURL = PREFIX_URL[env] + '/client';
  var BASE_URL = PREFIX_URL[env] + '/task';
  var LOGOUT_URL = PREFIX_URL[env] + '/task/logout/index';

  var WEBSITE = PREFIX_URL[env] + '/';
  var exportsJson = {
    ENV:env,
    BASE_URL:BASE_URL,
    LOGOUT_URL:LOGOUT_URL,
    INTERCEPT_SCHEME:INTERCEPT_SCHEME[env],
    weixinOauthUrl:"open.weixin.qq.com",
    qqOauthUrl:"openapi.qzone.qq.com",
    sinaOauthUrl:"api.weibo.com",
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
      return false;
    },
    MIN_WINDOW_WIDTH:1218,//1208
    MIN_WINDOW_HEIGHT:620,
    VERSION:VERSION[env],
    VERSIONURL:VERSIONURL,
    DOWNLOADURL:DOWNLOADURL
  }
  try{
    for(var index in exportsJson){
      window[index] = exportsJson[index];
    }
  }catch(e){
    module.exports = exportsJson
  }
})();
