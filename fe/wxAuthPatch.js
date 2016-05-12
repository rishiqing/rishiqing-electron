// 专门针对微信登录的补丁
module.exports = function (win, redirect) {
  var __ajax = win.$.ajax;
  win.$.ajax = function (url, options) {
    var __success = url.success;
    url.success = function (a, b, c) {
      var wx_errcode = win.wx_errcode;
      var wx_code = win.wx_code;
      if (wx_errcode === 405) {
        win.location = redirect + '?code=' + wx_code + '&state=undefined_empty_empty_empty_empty_empty'
      }
      __success(a, b, c);
    };
    return __ajax(url, options);
  };
}
