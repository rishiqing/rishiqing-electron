<template>
  <div id="download">
    <div class="list">
      <ul>
        <download-item v-for="file in downloadingList" :key="file.itemId" :file="file" :downloaded="false" :file-type-image-url="getFileTypeImageUrl(file)" :cancel="cancel"/>
        <download-item v-for="file in downloadedList" :key="file.itemId" :file="file" :downloaded="true" :file-type-image-url="getFileTypeImageUrl(file)" :open-item="openItem" :open-in-folder="openInFolder" :clear="clear"/>
      </ul>
    </div>
    <div class="footer">
      <a class="clear-all" @click="clearAll()">清除全部记录</a>
    </div>
  </div>
</template>

<script>
import electron     from 'electron'
import downloadItem from './pub/DownloadItem'
import downloadData from './pub/data'
import FileUtil     from '../utils/file'

const shell = electron.shell
export default {
  name: "download",
  components: {
    'download-item' : downloadItem
  },
  data(){
    return {
      downloadingList: downloadData.DownloadingList,
      downloadedList: downloadData.DownloadedList,
      baseUrl: process.env.BASE_URL
    }
  },
  methods: {
    getFileTypeImageUrl (file) {
      const type = FileUtil.getFileSmallImage(file.fileName)
      return `${this.baseUrl}file/${type}_2x.png`
    },
    openItem (file) {
      shell.openItem(file.savePath)
    },
    openInFolder (file) {
      shell.showItemInFolder(file.savePath)
    },
    cancel (file) {
      downloadData.cancelItem(file)
    },
    clear (file) {
      downloadData.clearItem(file)
    },
    clearAll () {
      downloadData.clearAll()
    }
  }
}
</script>

<style scoped>
*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
}

html, body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Noto Sans", "Noto Sans CJK SC", "Microsoft YaHei", "\5FAE\8F6F\96C5\9ED1", SimSun, sans-serif;
}
ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.hide {
  display: none !important;
}

#download {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
}
#download .list {
  height: calc(100% - 40px);
  overflow: auto;
  overflow-x: hidden;
}
#download ul {
  padding: 24px 20px 0 20px;
}
#download .download-item + .download-item {
  margin-top: 27px;
}
#download .footer {
  height: 40px;
  border-top: 1px solid #EAEAEA;
  display: flex;
  align-items: center;
  justify-content: center;
}
#download .footer > a {
  font-size: 12px;
  color: #0689DD;
  cursor: pointer;
}
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