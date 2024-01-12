<script setup lang="ts">
import { computed } from 'vue'

const defaultPort: {
  [key: string]: string
} = {
  http: '80',
  https: '443',
  socks4: '1080',
  socks5: '1080',
}

defineOptions({
  name: 'Proxy',
})
const config = defineModel<{
  mold: string
  host: string
  port: string
  username: string
  password: string
}>({
  required: true,
})

const placeholder = computed(() => {
  if (config.value.mold === 'socks4' || config.value.mold === 'socks5') {
    return {
      password: `不支持${config.value.mold}密码`,
      username: `不支持${config.value.mold}用户名`,
    }
  }
  return {}
})
const readonly = computed(() => {
  if (config.value.mold === 'none' || !config.value.mold) {
    return {
      host: true,
      port: true,
      username: true,
      password: true,
    }
  }
  if (config.value.mold === 'socks4' || config.value.mold === 'socks5') {
    return {
      username: true,
      password: true,
    }
  }
  return {}
})

const emit = defineEmits(['test-click'])
</script>

<template>
  <div class="section">
    <div class="title">网络代理</div>
    <div class="content">
      <div class="item">
        <div class="item-half">
          <span class="name">类型</span>
          <select v-model="config.mold">
            <option value="none">不使用代理</option>
            <option value="http">HTTP</option>
            <option value="https">HTTPS</option>
            <option value="socks4">SOCKS4</option>
            <option value="socks5">SOCKS5</option>
          </select>
        </div>
        <div class="item-half proxy-test">
          <span class="name"></span>
          <button @click="() => emit('test-click')">测试</button>
        </div>
      </div>
      <div class="item">
        <div class="item-half">
          <span class="name">地址</span>
          <input
            type="text"
            name="host"
            :readonly="!!readonly.host"
            v-model.trim.lazy="config.host"
          />
        </div>
        <div class="item-half">
          <span class="name">端口</span>
          <input
            type="text"
            name="port"
            :readonly="!!readonly.port"
            :placeholder="defaultPort[config.mold]"
            v-model.number.trim.lazy="config.port"
          />
        </div>
      </div>
      <div class="item">
        <div class="item-half">
          <span class="name">用户名</span>
          <input
            type="text"
            name="username"
            :placeholder="placeholder.username"
            :readonly="!!readonly.username"
            v-model.lazy="config.username"
          />
        </div>
        <div class="item-half">
          <span class="name">密码</span>
          <input
            type="password"
            name="password"
            :placeholder="placeholder.password"
            :readonly="!!readonly.password"
            v-model.lazy="config.password"
          />
        </div>
      </div>
    </div>
  </div>
</template>
