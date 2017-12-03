const $ = require('jquery');

const DefaultConfig = {
  tagName: 'div',
  className: '',
  events: null
};

class View {
  get $ () {
    return this.$el.find.bind(this.$el);
  }

  constructor (options) {
    this._opts = Object.assign({}, DefaultConfig, options);
    this._isClose = false;
    this._initTag();
    this._initEvents();
  }

  append (el) {
    this.el.appendChild(el);
  }

  html (str) {
    this.el.innerHTML = str;
  }

  remove () {
    const parent = this.el.parentNode;
    if (parent) parent.removeChild(this.el);
  }

  // 是否已经关闭
  isClose () {
    return !!this._isClose;
  }

  onClose () {}

  close () {
    this._isClose = true;
    this.onClose();
    this.remove();
  }

  // 获取字符串配置项
  _getStringOption (type) {
    if (typeof this._opts[type] === 'function') {
      return this._opts[type].call(this);
    } else if (typeof this._opts[type] === 'string') {
      return this._opts[type];
    } else return '';
  }

  // 获取对象配置项
  _getObjOption (type) {
    if (typeof this._opts[type] === 'function') {
      return this._opts[type].call(this);
    } else if (typeof this._opts[type] === 'object') {
      return this._opts[type];
    } else return null;
  }

  _initTag () {
    this.el = document.createElement(this._getStringOption('tagName'));
    const className = this._getStringOption('className');
    if (className) this.el.className = className;
    this.$el = $(this.el);
  }

  _initEvents () {
    const events = this._getObjOption('events');
    if (events && typeof events === 'object') {
      const eventMap = {};
      Object.keys(events).forEach((_key) => {
        const key = _key.trim();
        if (!key) return;
        const l = key.split(' ').filter(item => item);
        const eventName = l[0];
        const fnName = events[_key];
        if (typeof this[fnName] !== 'function') return;
        if (!eventMap[eventName]) eventMap[eventName] = [];
        eventMap[eventName].push({
          selector: l.slice(1, l.length).join(' '),
          fn: this[fnName]
        });
      });
      Object.keys(eventMap).forEach((eventName) => {
        this.el.addEventListener(eventName, (e) => {
          const targets = [e.target];
          Array.prototype.push.apply(targets, this._getParents(e.target));
          const targetFnList = eventMap[eventName].reduce((acc, item) => {
            const selector = item.selector;
            if (!selector) {
              acc.push({
                ele: this.el,
                fn: item.fn
              });
              return acc;
            }
            const eles = this.el.querySelectorAll(selector);
            Array.prototype.slice.call(eles).forEach(function (_ele) {
              acc.push({
                ele: _ele,
                fn: item.fn
              });
            });
            return acc;
          }, []);
          const triggerList = targetFnList.filter((item) => {
            if (targets.includes(item.ele)) return true;
            else return false;
          });
          triggerList.forEach((item) => {
            item.fn.call(this, e);
          });
        }, false);
      });
    }
  }

  _getParents (ele) {
    if (ele === this.el) return [];
    const l = [];
    let parent = function (e, top) {
      const p = e.parentElement;
      if (p !== top) {
        l.push(p);
        parent(p, top);
      } else {
        l.push(p);
      }
    }
    parent(ele, this.el);
    return l;
  }
}

module.exports = View;