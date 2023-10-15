
import express from 'express';
import { getImportFile, getPointHtmlPath, getServerPublic, parseHtml } from './util';
import process from 'process';
// import { join } from 'path';
// import { readFileSync } from 'fs';
import { createServer as createViteServer } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'
export default async function startServer() {
    const app = express();
    const config = await getImportFile('bossjob.config.js')
    const points = config.default.remotePoints
    const input = {}
    points.forEach(point => input[point.id] = `${point.root}/index.html`)
    app.use(express.static(getServerPublic(), {
        setHeaders: (res, path) => {
            if (path.endsWith('.js')) {
                res.set('Service-Worker-Allowed', '/');
            }
        }
    }));

    const vite = await createViteServer({
        plugins: [react()],
        server: {
            middlewareMode: true,
            preTransformRequests: false,
            hmr: false
        },
        base: `/dist-${config.default.serverId}/`,
        publicDir: process.cwd() + 'public',
        ssr: false,
        // envPrefix:point.id,
        appType: 'mpa',
        // base: `/${point.id}/`,
        mode: 'development',
        optimizeDeps: {

        }
    })

    const { default: start } = await vite.ssrLoadModule(path.resolve(process.cwd(), 'node_modules/bossjob-remote/dist/module-dev.js'))
    // const {default:start} = await getImportFile('node_modules/bossjob-remote/dist/module-dev.js')
    start(app, points, vite)
    app.use(vite.middlewares)
    // points.forEach(async (point) => {
    //     app.get(`/${point.id}`, async (req, res) => {
    //         const filePath = join(process.cwd(), getPointHtmlPath(point.id, true));
    //         let html = ''
    //         html = readFileSync(filePath, 'utf8')
    //         html = await vite.transformIndexHtml('index.html', html)
    //         res.end(html);
    //     })
    //     app.post(`/${point.id}`, async (req, res, next) => {
    //         try {
    //             const data = req.body?.data;
    //             let ssr = false, html
    //             if (point.ssr) {
    //                 const { default: renderer } = await vite.ssrLoadModule(path.resolve(process.cwd(), `src/${point.id}/renderer-dev.js`))
    //                     .catch(e => console.log({ e }))
    //                 console.log({ renderer })
    //                 ssr = await renderer(point.id, data, vite)
    //             }
    //             const filePath = join(process.cwd(), getPointHtmlPath(point.id, true));
    //             html = readFileSync(filePath, 'utf8')
    //             html = await vite.transformIndexHtml('index.html', html, 'http://localhost:3000')
    //             console.log({ html })
    //             const parsed = parseHtml(html)
    //             res.end(JSON.stringify({ ssr, ...parsed, dev: true }));
    //         } catch (error) {
    //             next(error)
    //         }
    //     })

    // })
    const server = app.listen(3000, () => {
        const host = server.address().address;
        const port = server.address().port;
        console.log(`Example app listening at http://${host}:${port}`);
    });
}

startServer()


