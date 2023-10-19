import process from "process"
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
                body: JSON.stringify({
                    initialProps: options.ssr ? options.initialProps : {},
                    timestamp: new Date().getTime()
                }),
            }).then(response => {
                console.log({ response })
                return response.json()
            })
                .catch((error) => {
                    console.error('Error:', error);
                    return {
                        inHead: null,
                        inBody: null,
                        component: null,
                        error: error
                    }
                });

            const headerScripts = data.scripts
                // ?.filter(script => !script?.textContent?.includes('import RefreshRuntime'))
                ?.map(config.parseScript) ?? []
            const headerLinks = data.links?.map(config.parseLink) ?? []
            const bodyScripts = data.bodyScripts?.map(config.parseScript) ?? []
            const initalSharedData = { ...data.initalSharedData, ...options.initalSharedData }
            const inital = [config.parseScript({
                id: `inital-${options.id}`,
                textContent: `
                 window.BOSSJOB_INITIAL_PROPS = window.BOSSJOB_INITIAL_PROPS || {};
                 window.BOSSJOB_SHARED_DATA = window.BOSSJOB_SHARED_DATA || {};

                 window.BOSSJOB_INITIAL_PROPS["${options.id}"] = ${JSON.stringify(options.initialProps ?? {})}
                 window.BOSSJOB_SHARED_DATA = {...window.BOSSJOB_SHARED_DATA,...${JSON.stringify(initalSharedData ?? {})}}
                 window.BOSSJOB_SHARED_DATA.env = "${config.env || process.env.NODE_ENV}"
                 `
            }),
                // data.dev && config.parseScript({
                //     textContent: `
                //         import RefreshRuntime from "/remote-get-started/@react-refresh" 
                //         if(!window.__vite_plugin_react_preamble_installed__) {
                //             RefreshRuntime.injectIntoGlobalHook(window)
                //             window.$RefreshReg$ = () => {}
                //             window.$RefreshSig$ = () => (type) => type
                //             window.__vite_plugin_react_preamble_installed__ = true
                //         }
                //        `
                // })
            ].filter(a => a)
            return {
                inHead: <>{[...inital, ...headerLinks, ...headerScripts]}</>,
                inBody: <>{bodyScripts}</>,
                component:
                    <div id={options.id} dangerouslySetInnerHTML={options.ssr ? { __html: data.ssr } : undefined}>

                    </div>

            }
        }
    }
}