
import express from 'express';
import cors from 'cors';
import { getClientDir, getImportFile, getPointHtmlPath } from './util';
import process from 'process';
import { join } from 'path';
import { readFileSync } from 'fs';
import { JSDOM } from 'jsdom'
// import ReactDomServer from 'react-dom/server.node'
// import serverRenderer from './serverRenderer';
// import ReactDomServer from 'react-dom/server'
// import React from 'react';

export default async function startServer() {
    const app = express();
    app.use(cors());

    // app.use(function (err, req, res) {
    //     console.error(err.stack); 
    //     res.status(500).send('Something broke!'); 
    // });
    const config = await getImportFile('bossjob.config.js')
    const points = config.default.remotePoints
    points.forEach(async point => {
        app.use(express.static(getClientDir(point.id)));
        app.post(`/${point.id}`, async (req, res, next) => {
            try {
                const data = req.body?.data;

                let ssr = false, html
                if (point.ssr) {
                    const { default: renderer } = await getImportFile(`dist-${point.id}/server/renderer/serverRenderer.js`)
                    ssr = await renderer(point.id, data)
                }
                const filePath = join(process.cwd(), getPointHtmlPath(point.id));
                html = readFileSync(filePath, 'utf8')
                const parsed = parseHtml(html)
                res.end(JSON.stringify({ ssr, ...parsed }));
            } catch (error) {
                next(error)
            }
        })
            ;
        const server = app.listen(3000, () => {
            const host = server.address().address;
            const port = server.address().port;
            console.log(`Example app listening at http://${host}:${port}`);
        });
    })
}
function parseHtml(htmlString) {
    const dom = new JSDOM(htmlString);
    const head = dom.window.document.querySelector('head');
    let scripts = []
    let links = []
    // 获取所有的script标签并提取src属性
    head.querySelectorAll('script').forEach(s => scripts.push({src:s.src}));
    // 获取所有的link标签并提取href属性
    head.querySelectorAll('link').forEach(l => links.push({href:l.href,rel:l.rel}));
    return { scripts, links }
}
startServer()


