const Vue = require('vue')

const template = `
  <div class="section">
    <div class="title">快捷键</div>
    <div class="content">
      <div class="item">
        <span class="name">激活应用窗口</span>
        <r-input
          v-model="inside.active"
          :hotkey-mode="true"
          placeholder="无"
          @appendClick="onClearClick('active')"
        >
          <template slot="append">清除</template>
        </r-input>
      </div>
      <div class="item">
        <span class="name">隐藏应用窗口</span>
        <r-input
          v-model="inside.hide"
          :hotkey-mode="true"
          placeholder="无"
          @appendClick="onClearClick('hide')"
        >
          <template slot="append">清除</template>
        </r-input>
      </div>
    </div>
  </div>
`;

Vue.component('r-hotkey', {
  props: {
    config: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      inside: {
        active: this.config.active,
        hide: this.config.hide,
      }
    };
  },
  template,
  methods: {
    onClearClick(type) {
      this.inside[type] = '';
    }
  },
  mounted() {
    this.$watch('inside', function(newVal) {
      const val = Object.assign({}, newVal);
      this.$emit('change', val);
    }, { deep: true });
    this.$watch('config', function(newVal) {
      this.inside = {
        active: newVal.active,
        hide: newVal.hide
      };
    }, { deep: true })
  }
})