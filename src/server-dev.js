
import express from 'express';
import { getImportFile, getPointHtmlPath, parseHtml } from './util';
import process from 'process';
import { join } from 'path';
import { readFileSync } from 'fs';
import { createServer as createViteServer } from 'vite'
import path from 'path'
export default async function startServer() {
    const app = express();
    const config = await getImportFile('bossjob.config.js')
    const points = config.default.remotePoints
    const vite = await createViteServer({
        server: { middlewareMode: true, preTransformRequests: true },
        appType: 'custom',
        // esbuild:{
        //     exclude:['@react-refresh','react','react-dom']
        // },
        base:'http://localhost:3000/',
        mode: 'development',
        optimizeDeps: {

        }
    })
    app.use(vite.middlewares)

    points.forEach(async point => {

        app.get(`/${point.id}`, async (req, res) => {
            const filePath = join(process.cwd(), getPointHtmlPath(point.id, true));
            let html = ''
            html = readFileSync(filePath, 'utf8')
            html = await vite.transformIndexHtml('index.html', html)
            res.end(html);
        })
        app.post(`/${point.id}`, async (req, res, next) => {
            try {
                const data = req.body?.data;
                let ssr = false, html
                if (point.ssr) {
                    const { default: renderer } = await vite.ssrLoadModule(path.resolve(process.cwd(), `src/${point.id}/renderer-dev.js`))
                        .catch(e => console.log({ e }))
                    console.log({ renderer })
                    ssr = await renderer(point.id, data, vite)
                }
                const filePath = join(process.cwd(), getPointHtmlPath(point.id, true));
                html = readFileSync(filePath, 'utf8')
                html = await vite.transformIndexHtml('index.html', html)
                console.log({ html })
                const parsed = parseHtml(html)
                res.end(JSON.stringify({ ssr, ...parsed }));
            } catch (error) {
                next(error)
            }
        })

    })
    const server = app.listen(3000, () => {
        const host = server.address().address;
        const port = server.address().port;
        console.log(`Example app listening at http://${host}:${port}`);
    });
}

startServer()


