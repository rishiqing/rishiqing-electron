/*
* @Author: apple
* @Date:   2016-01-18 11:45:05
* @Last Modified by:   qinyang
* @Last Modified time: 2017-12-03 15:18:37
*/
const $ = require('jquery');
const DATA_KEY            = 'shortcut.escEmitterQueue';
const EVENT_KEY           = `.${DATA_KEY}`;
const Event = {
  KEYDOWN : `keydown${EVENT_KEY}`
};
const VERSION = '0.0.2';

class Manager {
  constructor () {
    this.id     = 1;
    this.queue  = [];
    this.format = {};
    this._setListener();
  }
  static get VERSION () {
    return VERSION;
  }
  // public
  add () {// data里面包含执行的函数和执行函数的数据
    if (arguments.length === 0) {
      return;
    }
    let wrap, id;
    if (typeof arguments[0] === 'function') { // 如果第一个参数是函数,
      id = this._getId();
      wrap = {
        fn   : arguments[0],
        data : arguments[1],
        id   : id
      };
    } else if (typeof arguments[0] === 'object') {
      const fn = arguments[0].fn;
      id = this._getId();
      if (!(!fn || typeof fn !== 'function')) {
        wrap = {
          fn   : fn,
          data : arguments[0].data,
          id   : id
        };
      }
    }
    if (wrap && id) {
      this.queue.unshift(wrap);
      this.format[id] = wrap;
      return id;
    }
  }
  remove (_id) {
    if (typeof _id !== 'number') {
      return;
    }
    delete this.format[_id];
    const index = this._getIndex(_id);
    if (typeof index === 'number') {
      this.queue.splice(index, 1);
    }
  }
  dispatch (_id) {
    if (typeof _id !== 'number') {
      return;
    }
    const index = this._getIndex(_id);
    const data = this.queue[index];
    if (data) {
      delete this.format[_id];
      this._dispatch(data.fn, { escData: data.data });
      this.queue.splice(index, 1);
    }
  }
  // privite
  _setListener () {
    $(document).on(Event.KEYDOWN, (e) => {
      if (e.which === 27) {
        const data = this.queue.shift();
        if (data) {
          const id = data.id;
          const fn = data.fn;
          e.escData = data.data;// 放置用户最开始传进来的data
          delete this.format[id];
          this._dispatch(fn, e);
        }
      }
    });
  }
  _getId () {
    return this.id++;
  }
  _dispatch (fn, data) {
    fn(data);
  }
  _getIndex (_id) {
    let index;
    this.queue.forEach((item, i) => {
      if (item.id === _id) {
        index = i;
      }
    });
    return index;
  }
}

module.exports = new Manager();
