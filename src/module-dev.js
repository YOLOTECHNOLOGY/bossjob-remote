import { join } from "path";
import { getImportFile, getPointHtmlPath, parseHtml } from "./util";
import { readFileSync } from 'fs'
import process from "process";
const start = (app, points, vite) => {
    points.forEach(async (point) => {
        app.get(`/${point.id}`, async (req, res) => {
            const filePath = join(process.cwd(), getPointHtmlPath(point.id, true));
            let html = ''
            html = readFileSync(filePath, 'utf8')
            // html = await vite.transformIndexHtml('index.html', html)
            res.end(html);
        })
        app.post(`/${point.id}`, async (req, res, next) => {
            try {
                const data = req.body?.data;
                let ssr = false, html
                if (point.ssr) {
                    const { default: renderer } = await getImportFile(`src/${point.id}/renderer-dev.js`)
                        .catch(e => console.log({ e }))
                    console.log({ renderer })
                    ssr = await renderer(point.id, data)
                }
                const filePath = join(process.cwd(), getPointHtmlPath(point.id, true));
                html = readFileSync(filePath, 'utf8')
                // html = await vite.transformIndexHtml('index.html', html, 'http://localhost:3000')
                console.log({ html })
                const parsed = parseHtml(html)
                res.end(JSON.stringify({ ssr, ...parsed, dev: true }));
            } catch (error) {
                next(error)
            }
        })

    })
}
export default start
