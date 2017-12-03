/*
* @Author: apple
* @Date:   2016-02-17 18:18:27
* @Last Modified by:   qinyang
* @Last Modified time: 2017-12-03 16:01:07
*/
var $ = require('jquery');

var Loading = function () {
  this.$loading       = $('#loading');
  this.$loadingSplash = $('#loading .loading-splash');
  this.$networkError  = $('#loading .network-error');
  this.$mainIframe    = $('#main-iframe');
  this.mainWindow     = this.$mainIframe[0].contentWindow;

  this.AnimationEnd   = 'webkitAnimationEnd';
  this.fadeOutStr     = 'animated fadeOut';
  this.fadeInStr      = 'animated fadeIn';

  this.setListener();
}

// 设置监听
Loading.prototype.setListener = function () {
  var self = this;
  this.$networkError.on('click', function () {
    self.showSplash();
    setTimeout(function () {
      self.mainWindow.location.reload();
    }, 1000);
  }, false);
}

// 隐藏整个loading页面
Loading.prototype.hide = function () {
  var self = this;
  var hideAnimate = function () {
    $(this).hide();
    $(this).removeClass(self.fadeOutStr);
    $(this).off(self.AnimationEnd, hideAnimate);
  }
  this.$loading.on(this.AnimationEnd, hideAnimate);
  this.$loading.addClass(this.fadeOutStr);
}

// 显示整个loading页面
Loading.prototype.show = function (type) {
  var self = this;
  this.$loading.removeClass(this.fadeOutStr);
  if (this.$loading.is(':hidden')) {
    this.$loading.show();
    var showAnimate = function () {
      $(this).show();
      $(this).removeClass(self.fadeInStr);
      $(this).off(self.AnimationEnd, showAnimate);
    }
    this.$loading.on(this.AnimationEnd, showAnimate);
    this.$loading.addClass(this.fadeInStr);
  }

  this.$networkError.hide();
  this.$loadingSplash.hide();
  this.$loading.removeClass('pure-color');

  if (type === 'networkError') {
    this.showNetworkError();
  } else if (type === 'pureColor') {
    this.showPureColor();
  } else {
    this.showSplash();
  }
}

// 显示加载splash
Loading.prototype.showSplash = function () {
  this.$loadingSplash.show();
  this.$networkError.hide();
}
// 显示网络错误
Loading.prototype.showNetworkError = function () {
  this.$networkError.show();
  this.$loadingSplash.hide();
}
// 显示一个纯色
Loading.prototype.showPureColor = function () {
  this.$loading.addClass('pure-color');
}

module.exports = function () {
  return new Loading();
};
