
import express from 'express';
import cors from 'cors';
import react from '@vitejs/plugin-react-swc'
import { getClientDir, getImportFile, getPointHtmlPath, parseHtml } from './util';
import process from 'process';
import { join } from 'path';
import { readFileSync } from 'fs';
import { createServer as createViteServer } from 'vite'
import { createProxyMiddleware as proxy } from 'http-proxy-middleware'
import path from 'path'
export default async function startServer() {
    const app = express();

    // app.use(cors());
    const config = await getImportFile('bossjob.config.js')
    const points = config.default.remotePoints

    const vite = await createViteServer({
        server: { middlewareMode: true, preTransformRequests: false },
        appType: 'custom',
        mode: 'development',
    })
    app.use(vite.middlewares)

    points.forEach(async point => {
        
        app.get('/chat',async(req,res)=>{
            const filePath = join(process.cwd(), getPointHtmlPath(point.id, true));
            let html = ''
            // transformIndexHtml(url: string, html: string, originalUrl?: string): Promise<string>;
            html = readFileSync(filePath, 'utf8')
            html = await vite.transformIndexHtml('index.html', html)
            console.log({html })
            
            res.end(html);
        })
        app.post(`/${point.id}`, async (req, res, next) => {
            try {
                const data = req.body?.data;
                let ssr = false, html
                if (point.ssr) {
                    const renderer = await vite.ssrLoadModule(path.resolve(process.cwd(), `dist-${point.id}/server/renderer/serverRenderer-dev.js`))
                    ssr = await renderer(point.id, data, vite)
                }
                const filePath = join(process.cwd(), getPointHtmlPath(point.id, true));
                // transformIndexHtml(url: string, html: string, originalUrl?: string): Promise<string>;
                html = readFileSync(filePath, 'utf8')
                html = await vite.transformIndexHtml('index.html', html)
                console.log({ html })
                const parsed = parseHtml(html)
                res.end(JSON.stringify({ ssr, ...parsed }));
            } catch (error) {
                next(error)
            }
        })

        const server = app.listen(3000, () => {
            const host = server.address().address;
            const port = server.address().port;
            console.log(`Example app listening at http://${host}:${port}`);
        });
    })
}

startServer()


