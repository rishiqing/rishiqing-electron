<script setup lang="ts">
import RSwitch from './RSwitch.vue'
import RInput from './RInput.vue'
defineOptions({
  name: 'Download',
})


const config = defineModel<{
    inquiryDownloadPath:boolean,
    downloadPath:string
}>({ required: true })

const emit = defineEmits(['change'])

</script>

<template>
  <div class="section">
    <div class="title">下载</div>
    <div class="content">
      <div class="item download-path">
        <span class="name">存储位置</span>
        <RInput :readonly="true" v-model="config.downloadPath" @appendClick="() => emit('change')">
          <template v-slot:append>更改</template>
        </RInput>
      </div>
      <div class="item">
        <span class="name">下载之前询问保存的路径</span>
        <RSwitch v-model="config.inquiryDownloadPath"></RSwitch>
      </div>
    </div>
  </div>
</template>
