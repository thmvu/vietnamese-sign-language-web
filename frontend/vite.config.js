import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Copy MediaPipe WASM & JS files to public/mediapipe → serve locally
    // Tránh hoàn toàn CDN → không bị Edge Tracking Prevention chặn
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/@mediapipe/hands/**/*',
          dest: 'mediapipe/hands',
        },
        {
          src: 'node_modules/@mediapipe/camera_utils/**/*',
          dest: 'mediapipe/camera_utils',
        },
        {
          src: 'node_modules/@mediapipe/drawing_utils/**/*',
          dest: 'mediapipe/drawing_utils',
        },
      ],
    }),
  ],
  optimizeDeps: {
    exclude: [
      '@mediapipe/hands',
      '@mediapipe/camera_utils',
      '@mediapipe/drawing_utils',
    ],
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
      '/ai-service': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/ai-service/, ''),
      },
    },
  },
})

