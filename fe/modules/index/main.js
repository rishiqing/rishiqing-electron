import Vue      from 'vue'
import store    from '../../store'
import Index    from './Index.vue'
import electron from 'electron'

const webFrame = electron.webFrame

webFrame.setZoomFactor(1)
webFrame.setVisualZoomLevelLimits(1, 1)
webFrame.setLayoutZoomLevelLimits(0, 0)
new Vue({
  store,
  render: h => h(Index)
}).$mount('#index')