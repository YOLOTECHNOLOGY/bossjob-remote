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
                body: JSON.stringify({ initialProps: options.initialProps ?? {} }),
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

            const headerScripts = data.scripts?.map(config.parseScript)
            const headerLinks = data.links?.map(config.parseLink)
            const bodyScripts = data.bodyScripts?.map(config.parseScript)
            const initalSharedData = { ...data.initalSharedData, ...options.initalSharedData }
            const inital = config.parseScript({
                textContent: `
                 window.BOSSJOB_INITIAL_PROPS = window.BOSSJOB_INITIAL_PROPS || {};
                 window.BOSSJOB_SHARED_DATA = window.BOSSJOB_SHARED_DATA || {};

                 window.BOSSJOB_INITIAL_PROPS["${options.id}"] = ${JSON.stringify(options.initialProps ?? {})}
                 window.BOSSJOB_SHARED_DATA = {...window.BOSSJOB_SHARED_DATA,...${JSON.stringify(initalSharedData ?? {})}}
                 window.BOSSJOB_SHARED_DATA.env = "${process.env.NODE_ENV}"
                 `
            })
            return {
                inHead: <>{[inital, ...headerLinks, ...headerScripts]}</>,
                inBody: <>{bodyScripts}</>,
                component:
                    <div id={options.id} dangerouslySetInnerHTML={options.ssr ? { __html: data.ssr } : undefined}>

                    </div>

            }
        }
    }
}