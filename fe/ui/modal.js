/*
* @Author: apple
* @Date:   2015-12-22 18:14:41
* @Last Modified by:   qinyang
* @Last Modified time: 2017-12-03 15:27:23
* @用途：jquery 插件，modal
*/
const escQueue = require('../utils/esc-emitter-queue');
const $ = require('jquery');
const NAME = 'modal';
const VERSION = '0.0.2';
const DATA_KEY = 'rui.modal';
const EVENT_KEY = `.${DATA_KEY}`;
const DATA_API_KEY = '.data-api';
const IsShown_KEY = 'Modal-Show';

const Default = {
  animate                   : false,
  trigger                   : 'click',
  activeClass               : 'active',
  closeSel                  : '.modalClose',
  defaultCloseBtn           : false, // 默认的关闭按钮, 默认是没有的
  name                      : '弹窗',
  autoCloseWhenRouterChange : false,
  autoCloseWhenClickOuter   : true, // 点击两边的空白处，默认关闭
  closeViewAfterHide        : false, // 是否在modal关闭的时候，关闭content里面携带的backboneView
  alignCenter               : false, // 是否在 modal-content 元素上添加text-align: center
  alignMiddle               : true, // 是否采用我们自己研制的居中方案
  limitHeight               : null, // 值是数字，如果配置了limitHeight同时又配置了alignMiddle，则会限制弹窗的高度
  triggerCloseSel           : '.trigger-modal-close',
  template                  : '<div class="modal-backdrop">'
                            + '<div class="modal-content"></div>'
                            + '</div>'
};

const Event = {
  HIDE              : `hide${EVENT_KEY}`,
  HIDDEN            : `hidden${EVENT_KEY}`,
  SHOW              : `show${EVENT_KEY}`,
  SHOWN             : `shown${EVENT_KEY}`,
  // FOCUSIN           : `focusin${EVENT_KEY}`,
  // RESIZE            : `resize${EVENT_KEY}`,
  CLICK_DISMISS     : `click.dismiss${EVENT_KEY}`,
  KEYDOWN_DISMISS   : `keydown.dismiss${EVENT_KEY}`,
  MOUSEUP_DISMISS   : `mouseup.dismiss${EVENT_KEY}`,
  MOUSEDOWN_DISMISS : `mousedown.dismiss${EVENT_KEY}`,
  CLICK_DATA_API    : `click${EVENT_KEY}${DATA_API_KEY}`
};

const Trigger = {
  CLICK  : 'click',
  MANUAL : 'manual'
};

const ClassName = {
  BACKDROP           : 'modal-backdrop',
  OPEN               : 'modal-open',
  CONTENT            : 'modal-content',
  ALIGN_CENTER       : 'align-center',
  ALIGN_MIDDLE       : 'align-middle',
  DEFAULT_CLOSE_OPEN : 'default-close-open',
  DEFAULT_CLOSE      : 'default-close'
};

const Selector = {
  BACKDROP: '.' + ClassName.BACKDROP,
  CONTENT: '.' + ClassName.CONTENT,
  DEFAULT_CLOSE_OPEN: '.' + ClassName.DEFAULT_CLOSE_OPEN,
  DEFAULT_CLOSE: '.' + ClassName.DEFAULT_CLOSE
};

const ANIMATE = {
  IN: 'animated fadeIn',
  OUT: 'animated fadeOut'
};

const AnimationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';

let activeEle = null;

let ID = 0;

class Modal {
  constructor (element, config) {
    const stamp   = Math.random() + '';
    this.config   = $.extend({}, this.constructor.Default, { stamp: stamp }, config);
    if (this.config.trigger !== Trigger.CLICK && this.config.trigger !== Trigger.MANUAL) {
      throw new Error('目前trigger只支持click, manual');
    }
    this.element = element;
    this.closeSel = this.config.closeSel;
    this.onClose  = this.config.onClose;
    this._id      = ++ID;

    $(this.element).data(this.constructor.DATA_KEY, this);
    $(this.element).data('stamp', stamp);

    this._setShown(false);
    this.resetContainer();
  }

  // getter
  static get VERSION () {
    return VERSION;
  }

  static get Default () {
    return Default;
  }

  static get DATA_KEY () {
    return DATA_KEY;
  }

  static get AnimationEnd () {
    return AnimationEnd;
  }

  static get Event () {
    return Event;
  }

  static get Selector () {
    return Selector;
  }

  static get ClassName () {
    return ClassName;
  }

  static get ANIMATE () {
    return ANIMATE;
  }
  static get activeEle () {
    return activeEle;
  }
  static get IsShown_KEY () {
    return IsShown_KEY;
  }
  // setter
  static set activeEle (value) {
    activeEle = value;
  }

  // public
  init () {
    this.setElementData(this.config);
    this.setListener();
  }

  toggle () {
    const animate = this.constructor.ANIMATE;
    this.$Container.off(this.constructor.AnimationEnd);
    this.$Container.removeClass(animate.IN + ' ' + animate.OUT);
    return this._getShown() ? this._hide() : this.show();
  }

  hide () {
    this._setShown(false);
    $(this.element).trigger(this.constructor.Event.HIDE);
    $(this.element).removeClass(this.config.activeClass);
    $('body').removeClass(this.constructor.ClassName.OPEN);
    this._clearActiveEle();

    this.setEscapeEvent();
    this.setHideClickEvent();

    this._dealLimitHeight(false);

    const animate = this.constructor.ANIMATE;
    if (this.config.animate) {
      this.$Container.addClass(animate.OUT);
      this.$Container.one(this.constructor.AnimationEnd, () => {
        this.$Container.removeClass(animate.OUT);
        this.empty();
      });
    } else {
      this.empty();
    }
  }

  show (options) { // 这个参数用来在打开的时候，设置一些特有的显示方式，如调整到modal上面
    if (this._canActiveEleClear()) {
      $(this.element).trigger(this.constructor.Event.SHOW);
      this._setAsActiveEle();
      if (options && options.overModal) { // 当在显示的时候，需要inside-modal显示超过modal，设置这个参数
        this.overModal = true;
      }
      // 如果配置了alignMiddle 和 limitHeight 则需要通过@media来限制弹窗在超高的显示方式
      if (this.config.alignMiddle && this.config.limitHeight) {
        this._dealLimitHeight();
      }
      this._appendToBody();
      $(this.element).trigger(this.constructor.Event.SHOWN);
    } else {
      // 暂时不处理带有onClose方法的modal，先给一个简单的提示
      // 在该类型的modal打开时，必须认为关闭之后，才能打开新的modal
      const activeEleContext = $(this.constructor.activeEle).data(this.constructor.DATA_KEY);
      alertify.error('请先手动关闭' + activeEleContext.config.name + ',再使用' + this.config.name);
    }
  }

  empty () {
    this.detachContent();
    this.$Container.remove();
    this.resetContainer();
  }
  resetContainer () {
    this.$Container = $(this.constructor.Default.template);
    const $content = this.$Container.find(this.constructor.Selector.CONTENT);
    if (this.config.alignCenter) {
      $content.addClass(this.constructor.ClassName.ALIGN_CENTER);
    }
    if (this.config.alignMiddle) {
      $content.addClass(this.constructor.ClassName.ALIGN_MIDDLE);
    }
    $content.addClass(`modal-id-${this._id}`); // 为每个modal打上id标记
    this.Container  = this.$Container[0];
    this.$Container.data(this.constructor.DATA_KEY, this);
  }
  getContent () {
    const content = this.config.content;
    if (typeof content === 'function') {
      return $(content());
    } else {
      return $(content);
    }
  }
  setElementData (config) {
    $(this.element).data('activeClass', config.activeClass);
    $(this.element).data('stamp', config.stamp);
  }

  detachContent () {
    if (this.config.defaultCloseBtn) {
      this.$Container.removeClass(this.constructor.ClassName.DEFAULT_CLOSE_OPEN);
    }
    if (this.$Content) this.$Content.detach();
    if (this.config.closeViewAfterHide) {
      if (this.$Content && this.$Content[0] && this.$Content[0].backboneView) {
        this.$Content[0].backboneView.close();
      }
    }
    $('body').removeClass(this.constructor.ClassName.OVER_MODAL);
    this.overModal = false;
    $(this.element).trigger(this.constructor.Event.HIDDEN);
  }

  setEscapeEvent () {
    if (this._getShown()) {
      const _hide = this._hide.bind(this);
      this.escId = escQueue.add(_hide);
    } else if (!this._getShown()) {
      if (this.escId) {
        escQueue.remove(this.escId);
      }
    }
  }

  setHideClickEvent () {
    if (this._getShown()) {
      this.setHideEventWhenShow();
    } else if (!this._getShown()) {
      this.removeHideEvent();
    }
  }

  setHideEventWhenShow () {
    const event = this.constructor.Event;
    this.$Container.on(event.MOUSEDOWN_DISMISS, this.constructor.Selector.CONTENT, (evt) => {
      const $target = $(evt.target);
      if ($target.hasClass(this.constructor.ClassName.CONTENT)) {
        this._mouse_down_on_content = true; // 如果mousedown事件是在content元素上发生的，就把这个标记为true
        setTimeout(() => {
          this._mouse_down_on_content = false;
        }, 500);
      }
    });
    this.$Container.on(event.CLICK_DISMISS, (evt) => {
      const $target = $(evt.target);
      if ($target.hasClass(this.constructor.ClassName.CONTENT) && this.config.autoCloseWhenClickOuter && this._mouse_down_on_content) {
        this._hide();
      }
      this._mouse_down_on_content = false;
    });
    if (this.constructor.Selector.FOOTER) {
      this.$Container.on(event.CLICK_DISMISS, this.constructor.Selector.FOOTER, () => {
        this._hide();
      });
    }
    if (this.closeSel) {
      this.$Container.on(event.CLICK_DISMISS, this.closeSel, () => {
        this._hide();
      });
    }
    // 监听另外的元素的点击事件，该事件可以出发modal的关闭
    if (this.config.triggerCloseSel) {
      $(document).on(event.CLICK_DISMISS, this.config.triggerCloseSel, () => {
        this._hide();
      });
    }
    if (this.config.defaultCloseBtn) {
      $(document).on(event.CLICK_DISMISS, this.constructor.Selector.DEFAULT_CLOSE, () => {
        this._hide();
      });
    }
  }

  removeHideEvent () {
    const event = this.constructor.Event;
    this.$Container.off(event.CLICK_DISMISS);
    this.$Container.off(event.MOUSEDOWN_DISMISS);
    $(document).off(event.CLICK_DISMISS);
    // 停止监听backbone的事件
    if (this.backboneEventObj) {
      this.backboneEventObj.stopListening();
    }
  }

  setListener () {
    if (this.config.trigger === Trigger.CLICK) {
      $(this.element).on(this.constructor.Event.CLICK_DATA_API, () => {
        this.toggle();
      });
    }
  }

  // privite
  _hide (e) {
    if (!this._getShown()) return;
    if (this.onClose && typeof this.onClose === 'function') {
      this.onClose(this);
      if (e && e.type === 'keydown') {
        this.setEscapeEvent();
      }
    } else {
      this.hide();
    }
  }
  _setShown (value) {
    this._isShown = value;
  }
  _getShown () {
    return !!this._isShown;
  }
  _setAsActiveEle () {
    if (this.constructor.activeEle) {
      const activeEleContext = $(this.constructor.activeEle).data(this.constructor.DATA_KEY);
      if (activeEleContext) activeEleContext._hide();
    }
    this.constructor.activeEle = this.element;
  }
  _canActiveEleClear () {
    if (this.constructor.activeEle) {
      const activeEleContext = $(this.constructor.activeEle).data(this.constructor.DATA_KEY);
      if (activeEleContext) {
        if (activeEleContext.onClose && typeof activeEleContext.onClose === 'function' && activeEleContext._getShown()) {
          return false;
        } else {
          return true;
        }
      } else {
        return true;
      }
    } else {
      return true;
    }
  }
  _clearActiveEle () {
    this.constructor.activeEle = null;
  }
  _appendToBody () {
    const $content = this.getContent();
    this.$Container.find(this.constructor.Selector.CONTENT).append($content);
    this.$Content = $content;
    $('body').append(this.$Container);
    $('body').addClass(this.constructor.ClassName.OPEN);
    if (this.overModal) {
      $('body').addClass(this.constructor.ClassName.OVER_MODAL);
    }
    if (this.config.defaultCloseBtn) {
      this.$Container.addClass(this.constructor.ClassName.DEFAULT_CLOSE_OPEN);
    }
    this._setShown(true);
    $(this.element).addClass(this.config.activeClass);

    this.setEscapeEvent();
    this.setHideClickEvent();

    const animate = this.constructor.ANIMATE;
    if (this.config.animate) {
      this.$Container.addClass(animate.IN);
      this.$Container.one(this.constructor.AnimationEnd, () => {
        this.$Container.removeClass(animate.IN);
      });
    }
  }

  _dealLimitHeight (show = true) {
    if (show && this._limitHeightStyle) return;
    if (this._limitHeightStyle) {
      this._limitHeightStyle.remove();
      this._limitHeightStyle = null;
    } else {
      this._limitHeightStyle = $('<style type="text/css"></style>');
      // 这里有个计算公式，这是刚好距离顶部20px的时候。B代表浏览器高度，A代表limitHeight
      // 这个0.05是50% - 45%得来的，刚好是中点网上偏移5%的距离
      // (B - A) / 2 - 0.05 * B = 20
      // 由这个公式，已知A的值，我们可以求得，当B为多少的时候，刚好距离顶部20px
      // 这个时候就可以设置第一个@media，在这个@media里，只用取消用position和transform实现的居中，改用margin来实现水平居中就行
      // 然后第二个@media就需要控制height了，因为到了这个时候，浏览器高度不够，需要压缩内容的高度，那么就让height处于100%
      this._limitHeightStyle.text(`
        @media (max-height: ${(this.config.limitHeight + 40) * 10 / 9}px) {
          .${this.constructor.ClassName.BACKDROP} .${this.constructor.ClassName.CONTENT}.modal-id-${this._id} {
            padding: 20px 0;
          }
          .${this.constructor.ClassName.BACKDROP} .${this.constructor.ClassName.CONTENT}.modal-id-${this._id} > * {
            position: relative;
            top: 0;
            left: 0;
            margin: 0 auto;
            transform: none;
          }
        }
        @media (max-height: ${this.config.limitHeight + 40}px) {
          .${this.constructor.ClassName.BACKDROP} .${this.constructor.ClassName.CONTENT}.modal-id-${this._id} > * {
            height: 100%;
          }
        }
      `);
      $('head').append(this._limitHeightStyle);
    }
  }

  static _jQueryInterface () {
    const arg = [...arguments];
    return this.each(function () {
      let data = $(this).data(DATA_KEY);
      if (!data) {
        const _config = $.extend({}, arg[0]);
        data = new Modal(this, _config);
        $(this).data(DATA_KEY, data);
        data.init();
      }
      if (typeof arg[0] === 'string') {
        const _config = arg[0] === 'hide' ? '_hide' : arg[0];
        if (data[_config] === undefined) {
          throw new Error(`No method named "${arg[0]}"`);
        }
        data[_config].apply(data, arg.slice(1, arg.length));
      }
    });
  }
}

$.fn[NAME] = Modal._jQueryInterface;
$.fn[NAME].Constructor = Modal;

module.exports = Modal;
