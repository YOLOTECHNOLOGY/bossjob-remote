import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

async function getConfig () {
 
  return  {
    // plugins: [react()],
    build:{
      
      rollupOptions:{
        input:['src/index.js','src/build.js','src/cli.js','src/serverRenderer.jsx','src/serverRenderer-dev.jsx','src/server.js','src/server-dev.js'],
        output:{
          entryFileNames: `[name].js`
        }
      },
     
    }
  }
}
export default defineConfig(getConfig())
