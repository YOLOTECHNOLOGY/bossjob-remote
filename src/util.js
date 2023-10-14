
import { join } from 'path';
import process from 'process';
import { JSDOM } from 'jsdom'

export async function getImportFile(path) {
    const filePath = join(process.cwd(), path);
    const result = await import(filePath);
    return result
}

export function getClientDir(id, devMode = false) {
    if (devMode) {
        return `src/${id}/`
    }
    return `dist/client`
}
export function getServerDir(id, devMode = false) {
    if (devMode) {
        return `src/${id}/`
    }
    return `dist/server`
}
export function getServerPublic() {
   
    return `public`
}
export function getPointHtmlPath(id, devMode = false) {
    if (devMode) {
        return `src/${id}/index.html`
    }
    return `dist/client/src/${id}/index.html`
}

export function getPointIndexJsPath(id) {
    return `dist/client/src/${id}/index.js`
}

export function parseHtml(htmlString) {
    const dom = new JSDOM(htmlString);
    const head = dom.window.document.querySelector('head');
    const body = dom.window.document.querySelector('body');
    let scripts = []
    let links = []
    let bodyScripts = []
    // 获取所有的script标签并提取src属性
    head.querySelectorAll('script').forEach(s => {
        
        return scripts.push({ src: s.src,textContent: s.textContent })
    });
    body.querySelectorAll('script').forEach(s => bodyScripts.push({ src: s.src, textContent: s.textContent }));
    // 获取所有的link标签并提取href属性
    head.querySelectorAll('link').forEach(l => links.push({ href: l.href, rel: l.rel ,as:l.as}));

    return { scripts, links, bodyScripts }
}