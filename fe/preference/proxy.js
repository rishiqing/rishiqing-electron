const Vue = require('vue')

const template = `
<div class="section">
  <div class="title">网络代理</div>
  <div class="content">
    <div class="item">
      <div class="item-half">
        <span class="name">类型</span>
        <select v-model="inside.mold">
          <option value="none">不使用代理</option>
          <option value="http">HTTP</option>
          <option value="https">HTTPS</option>
          <option value="socks4">SOCKS4</option>
          <option value="socks5">SOCKS5</option>
        </select>
      </div>
      <div class="item-half proxy-test">
        <span class="name"></span>
        <button @click="onTestClick">测试</button>
      </div>
    </div>
    <div class="item">
      <div class="item-half">
        <span class="name">地址</span>
        <input type="text" name="host" :readonly="!!readonly.host" v-model.trim.lazy="inside.host">
      </div>
      <div class="item-half">
        <span class="name">端口</span>
        <input type="text" name="port" :readonly="!!readonly.port" :placeholder="defaultValue.port[inside.mold]" v-model.number.trim.lazy="inside.port">
      </div>
    </div>
    <div class="item">
      <div class="item-half">
        <span class="name">用户名</span>
        <input type="text" name="username" :placeholder="placeholder.username" :readonly="!!readonly.username" v-model.lazy="inside.username">
      </div>
      <div class="item-half">
        <span class="name">密码</span>
        <input type="password" name="password" :placeholder="placeholder.password" :readonly="!!readonly.password" v-model.lazy="inside.password">
      </div>
    </div>
  </div>
</div>
`;

Vue.component('r-proxy', {
  props: {
    config: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data: function () {
    return {
      inside: {
        mold: this.config.mold,
        host: this.config.host,
        port: this.config.port,
        username: this.config.username,
        password: this.config.password,
      },
      defaultValue: {
        port: {
          http: '80',
          https: '443',
          socks4: '1080',
          socks5: '1080',
        },
      },
    };
  },
  computed: {
    placeholder () {
      if (this.inside.mold === 'socks4' || this.inside.mold === 'socks5') {
        return {
          password: `不支持${this.inside.mold}密码`,
          username: `不支持${this.inside.mold}用户名`,
        };
      }
      return {}
    },
    readonly () {
      if (this.inside.mold === 'none' || !this.inside.mold) {
        return {
          host: true,
          port: true,
          username: true,
          password: true
        }
      }
      if (this.inside.mold === 'socks4' || this.inside.mold === 'socks5') {
        return {
          username: true,
          password: true,
        }
      }
      return {}
    }
  },
  template,
  methods: {
    onTestClick() {
      this.$emit('test-click');
    }
  },
  mounted() {
    this.$watch('inside', function(newVal) {
      const val = Object.assign({}, newVal)
      if (!val.port) {
        val.port = this.defaultValue.port[this.inside.mold]
      }
      this.$emit('change', val)
    }, { deep: true })
    this.$watch('config', function(newVal) {
      this.inside = {
        mold: newVal.mold,
        host: newVal.host,
        port: newVal.port,
        username: newVal.username,
        password: newVal.password,
      };
    }, { deep: true })
  }
})