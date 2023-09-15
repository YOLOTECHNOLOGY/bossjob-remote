
import express from 'express';
import cors from 'cors';
import { getClientDir, getImportFile, getPointHtmlPath, getServerPublic, parseHtml } from './util';
import process from 'process';
import { join } from 'path';
import { readFileSync } from 'fs';
// import ReactDomServer from 'react-dom/server.node'
// import serverRenderer from './serverRenderer';
// import ReactDomServer from 'react-dom/server'
// import React from 'react';

export default async function startServer() {
    const app = express();
    app.use(cors());
    const config = await getImportFile('bossjob.config.js')
    const points = config.default.remotePoints
    app.use(express.static(getServerPublic(),{
        setHeaders: (res, path) => {
          if (path.endsWith('.js')) {
            res.set('Service-Worker-Allowed', '/');
          }
        }
      }));
    app.use('/health',async(req,res)=>{
        res.setHeader('Content-Type', 'text/plain')
        res.statusCode = 200;
        res.statusMessage = 'ok';
        res.write('I\'m alive')
        res.end()
    })
    
    points.forEach(async point => {
        app.use(`/${point.id}`, express.static(getClientDir(point.id)))
        app.use(express.static(getClientDir(point.id)));
        app.get(`/${point.id}`,async(req,res)=>{
            const filePath = join(process.cwd(), getPointHtmlPath(point.id));
            let html = ''
            html = readFileSync(filePath, 'utf8')
            console.log({html })
            
            res.end(html);
        })
        app.post(`/${point.id}`, async (req, res, next) => {
            try {
                const data = req.body?.data;

                let ssr = false, html
                if (point.ssr) {
                    const { default: renderer } = await getImportFile(`dist-${point.id}/server/renderer/renderer.js`)
                    ssr = await renderer(point.id, data)
                }
                const filePath = join(process.cwd(), getPointHtmlPath(point.id));
                html = readFileSync(filePath, 'utf8')
                const parsed = parseHtml(html)
                res.end(JSON.stringify({ ssr, ...parsed }));
            } catch (error) {
                next(error)
            }
        });
        if(point.customService) {
            const service = await getImportFile(`dist-${point.id}/server/${point.customService}`)
            service?.default?.(app)
        }
    })
    const server = app.listen(3000, () => {
        const host = server.address().address;
        const port = server.address().port;
        console.log(`Example app listening at http://${host}:${port}`);
    });
}

startServer()


