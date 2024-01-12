<script setup lang="ts">
import { computed } from 'vue';
import RInput from './RInput.vue'
defineOptions({
  name: 'Download',
})

const cacheSize = defineModel<number>({
  required: true,
})

const     sizeString =() => {
      const bytes = cacheSize.value
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
      if (bytes === 0) return '0 B'
      const radix = Math.floor(Math.log(bytes) / Math.log(1024))
      const i = parseInt(String(radix), 10)
      return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i]
    }

const size = computed(() => sizeString())
const emit = defineEmits(['clear'])

const onAppendClick = () => {
  cacheSize.value = 0
  emit('clear')
}
</script>

<template>
  <div class="section">
    <div class="title">缓存</div>
    <div class="content">
      <div class="item">
        <span class="name">缓存大小</span>
        <r-input :readonly="true" v-model="size"  @appendClick="onAppendClick">
          <template v-slot:append>清除</template>
        </r-input>
      </div>
    </div>
  </div>
</template>
