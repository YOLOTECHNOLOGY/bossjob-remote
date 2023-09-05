import { Suspense } from "react";

export const getClient = config => {
    if (typeof config.parseScript !== 'function') {
        throw new Error(' config.parseScript must be a function! ')
    }
    if (typeof config.parseLink !== 'function') {
        throw new Error(' config.parseLink must be a function! ')
    }
    return {
        async connectModule(options) { // id baseUrl initalProps
            const data = await fetch(`${options.baseUrl}/${options.id}`, {
                method: 'POST', // or 'PUT'
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ initialProps: options.initialProps ?? {} }),
            }).then(response => response.json())
                .catch((error) => {
                    console.error('Error:', error);
                });

            const headerScripts = data.scripts?.map(s => config.parseScript(s, options.baseUrl))
            const headerLinks = data.links?.map(l => config.parseLink(l, options.baseUrl))
            const bodyScripts = data.bodyScripts?.map(s => config.parseScript(s, options.baseUrl))
            const inital = config.parseScript({
                contentText: `
                 window.BOSSJOB_INITIAL_PROPS = window.BOSSJOB_INITIAL_PROPS || {};
                 window.BOSSJOB_INITIAL_PROPS["${options.id}"] = ${JSON.stringify(options.initialProps ?? {})}
                `
            })
            return {
                inHead: <>{[inital, ...headerLinks, ...headerScripts]}</>,
                inBody: <>{bodyScripts}</>,
                component: <Suspense>
                    <div id={options.id} dangerouslySetInnerHTML={options.ssr ? data.ssr : undefined}>

                    </div>
                </Suspense>
            }
        }
    }
}