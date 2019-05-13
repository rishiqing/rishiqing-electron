<template>
 <div class="section">
  <div class="title">私有部署</div>
  <div class="content">
    <div class="item">
      <span class="name">启用私有部署</span>
      <r-switch v-model="enablePrivate"/>
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
</template>

<script>
import rswitch from './Rswitch.vue'
export default {
  name: "server",
  props: {
    config: {
      type: Object,
      default:() => ({})
    }
  },
  model: {
    prop: 'config',
    event: 'change'
  },
  data() {
    return {
      enablePrivate: this.config.enablePrivate,
      privateUrl: this.config.privateUrl,
    }
  },
  components: {
    'r-switch' : rswitch
  },
  mounted() {
    this.$watch(() => ({
      enablePrivate: this.enablePrivate,
      privateUrl: this.privateUrl,
    }), (newVal) => {
      this.$emit('change', newVal)
    })
    this.$watch('config', (newVal) => {
      this.enablePrivate = newVal.enablePrivate
      this.privateUrl = newVal.privateUrl
    }, { deep: true })
  },
}
</script>

<style scoped>

</style>