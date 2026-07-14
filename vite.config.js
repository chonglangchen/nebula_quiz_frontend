import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

// Backend: http://localhost:8080 (no context-path, quiz backend)
const BACKEND_TARGET = 'http://localhost:8080'

const proxyConfig = {
  '/api': {
    target: BACKEND_TARGET,
    changeOrigin: true
  },
  '/training-files': {
    target: BACKEND_TARGET,
    changeOrigin: true
  }
}

export default defineConfig({
  plugins: [uni()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/uni.scss";`
      }
    }
  },
  server: {
    proxy: proxyConfig
  }
})
