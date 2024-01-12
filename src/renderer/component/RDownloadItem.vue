<script setup lang="ts">
import { type FileType } from '../../types'
import { getFileSize } from '../utils/file'
defineOptions({
  name: 'RDownloadItem',
})

defineProps({
  file: {
    type: Object,
    required: true,
  },
  downloaded: Boolean,
  fileTypeImageUrl: String,
  openItem: {
    type: Function,
    default() {},
  },
  openInFolder: {
    type: Function,
    default() {},
  },
  cancel: {
    type: Function,
    default() {},
  },
  clear: {
    type: Function,
    default() {},
  },
})

const getSize = (file: FileType) => getFileSize(file.totalBytes)
</script>

<template>
  <li class="download-item">
    <img :src="fileTypeImageUrl" />
    <div class="info">
      <div class="name" :title="file.fileName">{{ file.fileName }}</div>
      <div v-if="!downloaded" class="progress">
        <div class="progress-bar" :style="{ width: file.percent + '%' }"></div>
        <span class="percent">{{ file.percent }}%</span>
      </div>
      <div v-else-if="downloaded" class="open">
        <a @click="openItem(file)">打开</a>
        <a @click="openInFolder(file)">在文件夹中显示</a>
      </div>
    </div>
    <div class="size">
      {{ getSize(file as FileType) }}
    </div>
    <div class="operate">
      <a v-if="!downloaded" class="cancel" @click="cancel(file)">取消</a>
      <a v-else-if="downloaded" class="clear" @click="clear(file)">清除</a>
    </div>
  </li>
</template>
