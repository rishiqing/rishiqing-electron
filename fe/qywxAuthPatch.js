// 专门针对企业微信登录的补丁
module.exports = function (win, opt) {
    var __ajax = win.$.ajax;
    win.$.ajax = function (url, options) {
        var __success = url.success;
        url.success = function (a, b, c) {
        if (a.status === 'QRCODE_SCAN_SUCC') {
            var uri = win.settings.redirect_uri
            win.location = uri + '?auth_code=' + a.auth_code + '&state=' + win.settings.state + '&appid=' + win.settings.appid
        }
        __success(a, b, c);
        };
        return __ajax(url, options);
    };
}
  