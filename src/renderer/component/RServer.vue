<script setup lang="ts">
import RSwitch from './RSwitch.vue'

defineOptions({
  name: 'Server',
})

const config = defineModel<{
  enablePrivate: boolean
  privateUrl: string
  privateBaseUrl: string
  officialUrl: string
  officialBaseUrl: string
}>({
  required: true,
})
</script>

<template>
  <div class="section">
    <div class="title">私有部署</div>
    <div class="content">
      <div class="item">
        <span class="name">启用私有部署</span>
        <RSwitch v-model="config.enablePrivate" />
      </div>
      <div class="item private-server">
        <span class="name">私有服务器地址</span>
        <input
          type="text"
          name="server-config"
          :readonly="!config.enablePrivate"
          v-model.lazy="config.privateUrl"
          placeholder="例: https://www.rishiqing.com"
        />
      </div>
      <div class="item private-server">
        <span class="name">私有服务器地址baseUrl</span>
        <input
          type="text"
          name="server-config"
          :readonly="!config.enablePrivate"
          v-model.lazy="config.privateBaseUrl"
          placeholder="例: /app"
        />
      </div>
    </div>
  </div>
</template>
