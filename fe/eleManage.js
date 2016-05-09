/*
* @Author: apple
* @Date:   2016-02-17 17:53:44
* @Last Modified by:   apple
* @Last Modified time: 2016-02-17 22:03:33
*/

;(function () {
  // 判断是否有某个class
  HTMLDivElement.prototype.hasClass = function (cls) {
    var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
    return reg.test(this.className);
  }
  // 添加一个class
  HTMLDivElement.prototype.addClass = function (cls) {
    if (!this.hasClass(cls)) this.className += ' ' + cls;
  }
  // 删除某个class
  HTMLDivElement.prototype.removeClass = function (cls) {
    if (this.hasClass(cls)) {
      var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
      this.className = this.className.replace(reg, ' ');
    }
  }
  // 开关某个class
  HTMLDivElement.prototype.toggleClass = function (cls) {
    if (this.hasClass(cls)) {
      this.removeClass(cls);
    } else {
      this.addClass(cls);
    }
  }

  // 隐藏某个元素
  HTMLDivElement.prototype.hide = function () {
    this.style.display = 'none';
  }

  // 显示某个元素
  HTMLDivElement.prototype.show = function () {
    this.style.display = '';
  }

  // 查看元素是否是隐藏状态
  HTMLDivElement.prototype.isHide = function () {
    return this.style.display === 'none' ? true : false;
  }

  // 查看元素是否是显示状态
  HTMLDivElement.prototype.isShow = function () {
    return this.style.display !== 'none' ? true : false;
  }
})();
