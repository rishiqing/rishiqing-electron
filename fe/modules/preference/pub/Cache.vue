<template>
<div class="section">
    <div class="title">缓存</div>
    <div class="content">
      <div class="item">
        <span class="name">缓存大小</span>
        <r-input :readonly="true" v-model="sizeString" @appendClick="onClearClick">
          <template slot="append">清除</template>
        </r-input>
      </div>
    </div>
  </div>
</template>

<script>
import rinput from './Rinput.vue'
export default {
  name: "cache",
  props: {
    size: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      bytes: this.size
    }
  },
  computed: {
    sizeString() {
      const bytes = this.bytes
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
      if (bytes === 0) return '0 B'
      const radix = Math.floor(Math.log(bytes) / Math.log(1024))
      const i = parseInt(radix, 10)
      return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i]
    }
  },
  methods: {
    onClearClick() {
      this.$emit('clear-click')
      this.bytes = 0
    }
  },
  components: {
    'r-input' : rinput
  }
}
</script>

<style scoped>

</style>