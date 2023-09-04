import { getClientDir, getImportFile, getServerDir } from './util'
import * as vite from 'vite'
import react from '@vitejs/plugin-react-swc'
import process from 'process'
export default async function build() {
  const env = process.argv[2]
  const { default: bossjobConfig } = await getImportFile('bossjob.config.js')
  const modules = bossjobConfig.remotePoints

  const tasks = modules.map(async module => {
    await vite.build({
      // plugins: [react({
      //   jsxImportSource: '@emotion/react',
      // })],
      mode: env,
      publicDir: process.cwd() + module.root,
      build: {
        minify: 'terser',
        ssr: false,
        outDir: getClientDir(module.id),
        cssCodeSplit: true,
        manifest: true,
        rollupOptions: {
          input: `${module.root}/index.html`,

          output: [{
            chunkFileNames: `[name]-[hash].js`,
            assetFileNames: `[name]-[hash].[ext]`,
            entryFileNames: `[name].js`

          }]
        }
      }
    })
    if (!module.ssr) {
      return
    }
    await vite.build({
      plugins: [react({
        jsxImportSource: '@emotion/react',

      })],
      
      mode: env,
      publicDir: process.cwd() + module.root,
      build: {
        minify: 'terser',
        ssr: true,
        manifest: true,
        outDir: getServerDir(module.id),
        rollupOptions: {

          input: `${module.root}/App.tsx`,
          output: 'renderer.js'
        }
      }
    })
    await vite.build({
      plugins: [react({
        jsxImportSource: '@emotion/react',

      })],
      mode: env,
      publicDir: process.cwd() + module.root,
      build: {
        ssr: true,
        manifest: true,
        outDir: getServerDir(module.id) + '/renderer',
        rollupOptions: {

          input: `bossjob-remote/dist/serverRenderer.js`,
          output: 'renderer.js'
        }
      }
    })
  })
  return await Promise.all(tasks)
}
build()