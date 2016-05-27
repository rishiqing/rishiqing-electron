/*
* @Author: apple
* @Date:   2016-02-17 17:53:44
* @Last Modified by:   qin yang
* @Last Modified time: 2016-05-27 17:40:34
*/

;(function () {
  // 判断是否有某个class
  HTMLElement.prototype.hasClass = function (cls) {
    var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
    return reg.test(this.className);
  }
  // 添加一个class
  HTMLElement.prototype.addClass = function (cls) {
    if (!this.hasClass(cls)) this.className += ' ' + cls;
  }
  // 删除某个class
  HTMLElement.prototype.removeClass = function (cls) {
    if (this.hasClass(cls)) {
      var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
      this.className = this.className.replace(reg, ' ');
    }
  }
  // 开关某个class
  HTMLElement.prototype.toggleClass = function (cls) {
    if (this.hasClass(cls)) {
      this.removeClass(cls);
    } else {
      this.addClass(cls);
    }
  }

  // 隐藏某个元素
  HTMLElement.prototype.hide = function () {
    this.style.display = 'none';
  }

  // 显示某个元素
  HTMLElement.prototype.show = function () {
    this.style.display = '';
  }

  // 查看元素是否是隐藏状态
  HTMLElement.prototype.isHide = function () {
    return this.style.display === 'none' ? true : false;
  }

  // 查看元素是否是显示状态
  HTMLElement.prototype.isShow = function () {
    return this.style.display !== 'none' ? true : false;
  }
})();
