import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
  optimizeDeps: {

  },
  build: {
    // minify: true,
    rollupOptions: {
      input: [
        'src/index.js',
        'src/build.js',
        'src/cli.js',
        'src/serverRenderer.jsx',
        'src/serverRenderer-dev.jsx',
        'src/server.js',
        'src/server-dev.js',
        'src/client.jsx',
        'src/clientStorage.js',
        'src/hooks.js',
        'src/module-dev.js'
      ],
      output: {
        entryFileNames: `[name].js`
      },
      external: ['react', 'react-dom']
    },
  }
})
