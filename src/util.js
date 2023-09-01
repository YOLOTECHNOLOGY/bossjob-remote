
import { join } from 'path';
import process from 'process';

export async function getImportFile(path) {
    const filePath = join(process.cwd(), path);
    const result = await import(filePath);
    return result
}

export function getClientDir(id) {
    return `dist-${id}/client`
}
export function getServerDir(id) {
   return  `dist-${id}/server`
}

export function getPointHtmlPath(id) {
    return `dist-${id}/client/src/${id}/index.html`
}

export function getPointIndexJsPath(id) {
    return `dist-${id}/client/index.js`
}