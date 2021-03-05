import Vue      from 'vue'
import store    from '../../store'
import Download from './Download.vue'
import electron from 'electron'

const webFrame = electron.webFrame

webFrame.setZoomFactor(1)
webFrame.setVisualZoomLevelLimits(1, 1)

new Vue({
  store,
  render: h => h(Download)
}).$mount('#download')
