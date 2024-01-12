import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import {resolve} from 'node:path'
import { devPlugin, getReplacer } from "./plugins/devPlugin"
import { buildPlugin } from "./plugins/buildPlugin"
import optimizer from "vite-plugin-optimizer"

export default defineConfig({
  appType:'mpa',
  plugins: [optimizer(getReplacer()), vue({
    template:{
      compilerOptions:{
        isCustomElement: (tag) => tag === 'WebView'
      }
    }
  }), devPlugin()],
  build: {
    rollupOptions: {
      plugins: [buildPlugin()],
      input: {
        welcome: resolve(__dirname, 'welcome/index.html'),
        preference: resolve(__dirname, 'preference/index.html'),
        download: resolve(__dirname, 'download/index.html'),
      },
    },
  },

})
