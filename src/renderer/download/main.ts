import '../style.scss'
import { createApp } from 'vue'
import Download from './Download.vue'
import { webFrame } from 'electron'
webFrame.setZoomFactor(1)
webFrame.setVisualZoomLevelLimits(1, 1)
createApp(Download).mount('#app')
