import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

const BACKEND_TARGET = 'http://localhost:8070'

export default defineConfig({
  plugins: [
    uni(),
    {
      name: 'force-remove-xframe',
      configureServer(server) {
        // 在服务器启动后，监听请求事件
        server.httpServer.on('request', (req, res) => {
          // 保存原始 writeHead 方法
          const originalWriteHead = res.writeHead.bind(res)
          res.writeHead = function(statusCode, statusMessage, headers) {
            // 移除所有形式的 X-Frame-Options
            if (this.getHeader('X-Frame-Options')) {
              this.removeHeader('X-Frame-Options')
            }
            // 如果 headers 参数中有，也删除
            if (headers) {
              delete headers['X-Frame-Options']
            }
            // 调用原始 writeHead
            return originalWriteHead(statusCode, statusMessage, headers)
          }
          
          // 拦截 setHeader
          const originalSetHeader = res.setHeader.bind(res)
          res.setHeader = function(name, value) {
            if (name.toLowerCase() === 'x-frame-options') {
              // 忽略设置
              return this
            }
            return originalSetHeader(name, value)
          }
        })
      }
    }
  ],
  css: {
  		preprocessorOptions: {
  			scss: {
  				additionalData: `@import "@/uni.scss";`,
  				api: 'modern-compiler',
  				silenceDeprecations: ['import']
  			}
  		}
  	},
  server: {
    proxy: {
      '/api': { target: BACKEND_TARGET, changeOrigin: true },
      '/training-files': { target: BACKEND_TARGET, changeOrigin: true }
    }
  }
})