<template>
<div class="section restore-setting">
    <div class="content">
      <button @click="onClick" title="恢复默认设置">恢复设置</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "restore",
  methods: {
    onClick() {
      this.$emit('restore')
    }
  }
}
</script>

<style scoped>

</style>