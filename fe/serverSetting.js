const CommonView = require('./utils/view');
const settingTemplate = require('./hbs/settingModal.hbs');

const DefaultConfig = {
  onSave: function () {}
};

class View extends CommonView {
	constructor (config, options) {
    super({
      className: 'server-setting',
      events: {
      	'click form button.save': 'onSave',
        'change form': 'onFormChange',
        'input [name=custom-server-name]': 'onFormChange'
      }
    });
    this.settings = Object.assign({}, DefaultConfig, options);
    this.isSaveDisable = false;
    this.render(config);
  }

  render (config) {
    this.html(settingTemplate(config));
    this.$saveBtn = this.$('form button.save');
    this.setSaveBtnState();
  }

  setSaveBtnState () {
    let urlRegex = '^(?!mailto:)(?:(?:http|https)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';
    urlRegex = new RegExp(urlRegex, 'i');
    var data = this.getFormData();
    var isStateOk = true;
    if (data['server-type'] === 'custom') {
      isStateOk = urlRegex.test(data['custom-server-name'])
      try {
        new URL(data['custom-server-name']);
      } catch(e) {
        isStateOk = false;
      }
    }
    if (!isStateOk) {
      this.$saveBtn.addClass('disabled');
      this.$saveBtn.text('自定义服务器地址格式不对');
      this.isSaveDisable = true;
    } else {
      this.$saveBtn.removeClass('disabled');
      this.$saveBtn.text('保存');
      this.isSaveDisable = false;
    }
  }

  getFormData () {
    const formData = new FormData(this.$('form')[0]);
    const data = {};
    for (const pair of formData.entries()) {
      data[pair[0]] = pair[1];
    }
    return data;
  }

  onFormChange () {
    this.setSaveBtnState();
  }

  onSave () {
    if (this.isSaveDisable) return;
    var data = this.getFormData();
    try {
      data['custom-server-name'] = new URL(data['custom-server-name']).origin;
    } catch(e) {
      // 如果上面解析custome-server-name出错，那就把server-type指定为officiel
      data['server-type'] = 'officiel';
    }
    this.settings.onSave(data);
  }
}

module.exports = View;