/*
* @Author: apple
* @Date:   2016-02-18 14:37:14
* @Last Modified by:   qinyang
* @Last Modified time: 2017-12-03 17:15:42
*/
var $ = require('jquery');

var AlertTip = function () {
  this.$alert          = $('#alert');
  this.$alertContent   = $('#alert .content');

  this.AnimationEnd    = 'webkitAnimationEnd';
  this.fadeInDownBig   = 'animated fadeInDownBig';
  this.fadeOutUpBig    = 'animated fadeOutUpBig';
}

AlertTip.prototype.show = function (str) {
  console.log('show');
  var self        = this;
  this.$alertContent.show();
  this.$alertContent.html(`<span>${str}</span>`);
  this.$alertContent.removeClass(this.fadeOutUpBig);
  var showAnimate = function () {
    console.log('show animate event');
    self.$alertContent.removeClass(self.fadeInDownBig);
    self.$alertContent.on(self.AnimationEnd, showAnimate);
  }
  this.$alertContent.on(this.AnimationEnd, showAnimate);
  this.$alertContent.addClass(this.fadeInDownBig);
}

AlertTip.prototype.hide = function () {
  console.log('hide');
  var self     = this;
  this.$alertContent.removeClass(this.fadeInDownBig);
  var hideAnimate = function () {
    console.log('hide animate event');
    self.$alertContent.html('');
    self.$alertContent.removeClass(self.fadeOutUpBig);
    self.$alertContent.off(self.AnimationEnd)
    self.$alertContent.hide();
  }

  this.$alertContent.on(this.AnimationEnd, hideAnimate);
  this.$alertContent.addClass(this.fadeOutUpBig);
}

module.exports = function () {
  return new AlertTip();
}
