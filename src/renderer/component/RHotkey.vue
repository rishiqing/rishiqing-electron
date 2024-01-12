<script setup lang="ts">
import RInput from './RInput.vue'

defineOptions({
  name: 'Hotkey',
})

const config = defineModel<{
  toggle: string
}>({ required: true })
</script>

<template>
  <div class="section">
    <div class="title">快捷键</div>
    <div class="content">
      <div class="item">
        <span class="name">激活/隐藏应用窗口</span>
        <RInput
          v-model="config.toggle"
          :hotkey-mode="true"
          placeholder="无"
          @appendClick="config.toggle = ''"
        >
          <template v-slot:append>清除</template>
        </RInput>
      </div>
    </div>
  </div>
</template>
