<template>
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
</template>

<script>
import rinput    from './Rinput.vue'
import rswitch   from './Rswitch.vue'
export default {
  name: "download",
  props: {
    config: {
      type: Object,
      default () {
        return {
          inquiryDownloadPath: false,
          downloadPath: ''
        }
      }
    }
  },
  computed: {
    path() {
      return this.config.downloadPath
    },
    inquiry: {
      get() {
        return this.config.inquiryDownloadPath
      },
      set(v) {
        this.config.inquiryDownloadPath = v
      }
    }
  },
  methods: {
    onChangeClick() {
      this.$emit('change-click')
    },
    onInquiryChange(val) {
      this.$emit('inquiry-change', val)
    }
  },
  components: {
    'r-input' : rinput,
    'r-switch': rswitch
  }
}
</script>

<style scoped>

</style>