/*
* @Author: apple
* @Date:   2016-02-17 18:18:27
* @Last Modified by:   qinyang
* @Last Modified time: 2017-05-08 15:42:42
*/

var Loading = function (window) {
  this.document       = window.document;
  this.window         = window;
  this.$loading       = this.document.querySelector('#loading');
  this.$loadingSplash = this.document.querySelector('#loading .loading-splash');
  this.$networkError  = this.document.querySelector('#loading .network-error');
  this.$mainIframe    = this.document.querySelector('#main-iframe');
  this.mainWindow     = this.$mainIframe.contentWindow;

  this.AnimationEnd   = 'webkitAnimationEnd';
  this.fadeOutStr     = 'animated fadeOut';
  this.fadeInStr      = 'animated fadeIn';

  this.setListener();
}

// 设置监听
Loading.prototype.setListener = function () {
  var self = this;
  this.$networkError.addEventListener('click', function () {
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
    this.hide();
    this.removeClass(self.fadeOutStr);
    this.removeEventListener(self.AnimationEnd, hideAnimate, false);
  }
  this.$loading.addEventListener(this.AnimationEnd, hideAnimate, false);
  this.$loading.addClass(this.fadeOutStr);
}

// 显示整个loading页面
Loading.prototype.show = function (type) {
  var self = this;
  this.$loading.removeClass(this.fadeOutStr);
  if (this.$loading.isHide()) {
    this.$loading.show();
    var showAnimate = function () {
      this.show();
      this.removeClass(self.fadeInStr);
      this.removeEventListener(self.AnimationEnd, showAnimate, false);
    }
    this.$loading.addEventListener(this.AnimationEnd, showAnimate, false);
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

module.exports = function (window) {
  return new Loading(window);
};
