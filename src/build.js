import { getClientDir, getImportFile, getServerDir } from './util'
import * as vite from 'vite'
import process from 'process'
export default async function build() {
  const env = process.argv[2]
  const { default: bossjobConfig } = await getImportFile('bossjob.config.js')
  const modules = bossjobConfig.remotePoints
  const input = {}
  modules.forEach(module => input[module.id] = `${module.root}/index.html`)
  await vite.build({
    mode: env,
    base: `/dist-${bossjobConfig.serverId}/`,
    publicDir: process.cwd() + 'public',
    build: {
      minify: false,
      manifest: true,
      ssr: false,
      outDir: getClientDir(),
      cssCodeSplit: true,
      // manifest: true,
      rollupOptions: {
        input 

        // output: [{
        //   chunkFileNames: `[name]-[hash].js`,
        //   assetFileNames: `[name]-[hash].[ext]`,
        //   entryFileNames: `[name].js`

        // }],

      }
    }
  })
  
   modules.map(async module => {
    if (module.customService) {
      await vite.build({
        mode: env,
        base: `/${module.id}/`,
        publicDir: process.cwd() + module.root,
        build: {
          ssr: true,
          manifest: true,
          outDir: getServerDir(module.id) + '/',
          rollupOptions: {
            input: `${module.root}/${module.customService}`,
            output: module.customService
          }
        }
      })
    }
    if (!module.ssr) {
      return
    }
    await vite.build({
      mode: env,
      base: `/${module.id}/`,
      publicDir: process.cwd() + module.root,
      build: {
        minify: 'terser',
        ssr: true,
        manifest: true,
        outDir: getServerDir(module.id),
        rollupOptions: {

          input: `${module.root}/App.tsx`,
          // output: 'renderer.js'

        }
      }
    })
    await vite.build({
      mode: env,
      base: `/${module.id}/`,
      publicDir: process.cwd() + module.root,
      build: {
        ssr: true,
        manifest: true,
        outDir: getServerDir(module.id) + '/renderer',
        rollupOptions: {

          input: `${module.root}/renderer.js`,
          output: 'serverRenderer.js'
        }
      }
    })
    await vite.build({
      mode: env,
      base: `/${module.id}/`,
      publicDir: process.cwd() + module.root,
      build: {
        ssr: true,
        manifest: true,
        outDir: getServerDir(module.id) + '/renderer-dev',
        rollupOptions: {

          input: `${module.root}/renderer-dev.js`,
          output: 'serverRenderer.js'
        }
      }
    })

  })
  // return await Promise.all(tasks)
}
build()