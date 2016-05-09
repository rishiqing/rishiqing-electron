/*
* @Author: apple
* @Date:   2016-02-18 14:37:14
* @Last Modified by:   apple
* @Last Modified time: 2016-02-18 15:38:02
*/

var AlertTip = function (window) {
  this.window          = window;
  this.document        = window.document;
  this.$alert          = this.document.querySelector('#alert');
  this.$alertContent   = this.document.querySelector('#alert .content');

  this.AnimationEnd    = 'webkitAnimationEnd';
  this.fadeInDownBig   = 'animated fadeInDownBig';
  this.fadeOutUpBig    = 'animated fadeOutUpBig';
}

AlertTip.prototype.show = function (str) {
  this.window.console.log('show');
  var self        = this;
  this.$alertContent.show();
  this.$alertContent.innerHTML = '<span>' + str + '</span>';
  this.$alertContent.removeClass(this.fadeOutUpBig);
  var showAnimate = function () {
    self.window.console.log('show animate event');
    self.$alertContent.removeClass(self.fadeInDownBig);
    self.$alertContent.removeEventListener(self.AnimationEnd, showAnimate, false);
  }
  this.$alertContent.addEventListener(this.AnimationEnd, showAnimate, false);
  this.$alertContent.addClass(this.fadeInDownBig);
}

AlertTip.prototype.hide = function () {
  this.window.console.log('hide');
  var self     = this;
  this.$alertContent.removeClass(this.fadeInDownBig);
  var hideAnimate = function () {
    self.window.console.log('hide animate event');
    self.$alertContent.innerHTML = '';
    self.$alertContent.removeClass(self.fadeOutUpBig);
    self.$alertContent.removeEventListener(self.AnimationEnd, hideAnimate, false);
    self.$alertContent.hide();
  }

  this.$alertContent.addEventListener(this.AnimationEnd, hideAnimate, false);
  this.$alertContent.addClass(this.fadeOutUpBig);
}

module.exports = function (window) {
  return new AlertTip(window);
}
