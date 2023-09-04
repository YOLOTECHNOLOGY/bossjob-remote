import ReactDomServer from 'react-dom/server'
import { getImportFile } from './util'
const serverRenderer = async (id, data) => {
  const { default: App } = await getImportFile(`src/${id}/App.tsx`)
  return ReactDomServer.renderToString(<App {...data} />)
}

export default serverRenderer