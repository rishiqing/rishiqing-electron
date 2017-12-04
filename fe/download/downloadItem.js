const Vue      = require('vue');
const FileUtil = require('../utils/file');

const template = `
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
`;

Vue.component('download-item', {
  props: {
    file: Object,
    downloaded: Boolean,
    fileTypeImageUrl: String,
    openItem: {
      type: Function,
      default: function () {}
    },
    openInFolder: {
      type: Function,
      default: function () {}
    },
    cancel: {
      type: Function,
      default: function () {}
    },
    clear: {
      typeof: Function,
      default: function () {}
    }
  },
  template: template,
  methods: {
    getSize (file) {
      return FileUtil.getFileSize(file.totalBytes);
    }
  }
});