import '../style.scss'
import { createApp } from 'vue'
import Welcome from './Welcome.vue'
import { webFrame } from 'electron'
webFrame.setZoomFactor(1)
webFrame.setVisualZoomLevelLimits(1, 1)
createApp(Welcome).mount('#app')
