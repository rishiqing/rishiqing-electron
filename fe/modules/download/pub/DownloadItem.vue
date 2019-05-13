<template>
   <li class="download-item">
    <img :src="fileTypeImageUrl">
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
      {{ getSize(file) }}
    </div>
    <div class="operate">
      <a v-if="!downloaded" class="cancel" @click="cancel(file)">取消</a>
      <a v-else-if="downloaded" class="clear" @click="clear(file)">清除</a>
    </div>
  </li>
</template>

<script>
import FileUtil from '../../utils/file'
export default {
  name: "download",
  props:{
    file: Object,
    downloaded: Boolean,
    fileTypeImageUrl: String,
    openItem: {
      type: Function,
      default() {}
    },
    openInFolder: {
      type: Function,
      default() {}
    },
    cancel: {
      type: Function,
      default() {}
    },
    clear: {
      typeof: Function,
      default() {}
    }
  },
  methods: {
    getSize (file) {
      return FileUtil.getFileSize(file.totalBytes)
    }
  }
}
</script>

<style scoped>
.download-item {
  display: flex;
  align-items: center;
  height: 28px;
}
.download-item > img {
  width: 24px;
  height: 28px;
}
.download-item .info {
  flex: auto;
  height: 100%;
  flex-direction: column;
  justify-content: space-between;
  display: flex;
  padding-left: 16px;
  max-width: 208px;
}
.download-item .info .name {
  font-size: 13px;
  color: #3D3D3D;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  max-width: 199px;
  text-overflow: ellipsis;
}
.download-item .info .open {
  font-size: 12px;
  color: #6BC859;
  line-height: 1;
}
.download-item .info .open a + a {
  margin-left: 16px;
}
.download-item .info .open > a {
  cursor: pointer;
}
.download-item .info .progress {
  width: 102px;
  height: 6px;
  border-radius: 3px;
  background: #EFEFEF;
  position: relative;
}
.download-item .info .progress-bar {
  height: 100%;
  width: 0;
  background: #5BBBFC;
  border-radius: 3px;
}
.download-item .info .percent {
  font-size: 12px;
  position: absolute;
  right: -3em;
  top: -3px;
  line-height: 1;
  color: #1BA4FF;
}
.download-item .size {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  width: 5em;
  text-align: right;
}
.download-item .operate {
  padding-left: 20px;
  cursor: pointer;
  white-space: nowrap;
}
.download-item .cancel {
  font-size: 12px;
  color: #0689DD;
}
.download-item .clear {
  font-size: 12px;
  color: #9B9B9B;
}

</style>