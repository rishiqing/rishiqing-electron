const Vue = require('vue')

const template = `
<div class="section">
  <div class="title">私有部署</div>
  <div class="content">
    <div class="item">
      <span class="name">启用私有部署</span>
      <r-switch v-model="enablePrivate"></r-switch>
    </div>
    <div class="item private-server">
      <span class="name">私有服务器地址</span>
      <input
        type="text"
        name="server-config"
        :readonly="!enablePrivate"
        v-model.lazy="privateUrl"
        placeholder="例: https://www.rishiqing.com"
      />
    </div>
  </div>
</div>
`;

Vue.component('r-server', {
  model: {
    prop: 'config',
    event: 'change'
  },
  props: {
    config: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  template,
  data() {
    return {
      enablePrivate: this.config.enablePrivate,
      privateUrl: this.config.privateUrl,
    }
  },
  mounted() {
    this.$watch(function() {
      return {
        enablePrivate: this.enablePrivate,
        privateUrl: this.privateUrl,
      }
    }, function(newVal) {
      this.$emit('change', newVal)
    })
    this.$watch('config', function(newVal) {
      this.enablePrivate = newVal.enablePrivate;
      this.privateUrl = newVal.privateUrl;
    }, { deep: true })
  },
})