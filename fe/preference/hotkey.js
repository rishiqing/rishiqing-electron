const Vue = require('vue')

const template = `
  <div class="section">
    <div class="title">快捷键</div>
    <div class="content">
      <div class="item">
        <span class="name">激活/隐藏应用窗口</span>
        <r-input
          v-model="inside.toggle"
          :hotkey-mode="true"
          placeholder="无"
          @appendClick="onClearClick('toggle')"
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
        toggle: this.config.toggle,
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
        toggle: newVal.toggle,
      };
    }, { deep: true })
  }
})