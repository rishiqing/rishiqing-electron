const Vue = require('vue')

const template = `
  <div class="section">
    <div class="title">下载</div>
    <div class="content">
      <div class="item download-path">
        <span class="name">存储位置</span>
        <r-input :readonly="true" v-model="path" @appendClick="onChangeClick">
          <template slot="append">更改</template>
        </r-input>
      </div>
      <div class="item">
        <span class="name">下载之前询问保存的路径</span>
        <r-switch v-model="inquiry" @change="onInquiryChange"></r-switch>
      </div>
    </div>
  </div>
`;

Vue.component('r-download', {
  props: {
    config: {
      type: Object,
      default: {
        inquiryDownloadPath: false,
        downloadPath: ''
      }
    }
  },
  computed: {
    path() {
      return this.config.downloadPath
    },
    inquiry: {
      get() {
        return this.config.inquiryDownloadPath;
      },
      set(v) {
        this.config.inquiryDownloadPath = v;
      }
    }
  },
  template,
  methods: {
    onChangeClick() {
      this.$emit('change-click')
    },
    onInquiryChange(val) {
      this.$emit('inquiry-change', val)
    }
  }
})