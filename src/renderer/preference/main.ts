import '../style.scss'
import { createApp } from 'vue'
import Preference from './Preference.vue'
import { webFrame } from 'electron'
webFrame.setZoomFactor(1)
webFrame.setVisualZoomLevelLimits(1, 1)
createApp(Preference).mount('#app')
