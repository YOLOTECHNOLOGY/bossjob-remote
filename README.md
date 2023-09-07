# Bossjob 远程模块构建连接库

- 1 创建远程模块，远程模块基于vite。
```
yarn create vite
```
- 2 安装bossjob-remote:
```
yarn add bossjob-remote
```
- 3 在根目录下创建bossjob.config.js 一个工程可以包含多个模块
```
export default {
    remotePoints: [
        {
            id: 'chat',       // 模块唯一id
            ssr: false,       // 是否启用服务端渲染
            root: 'src/chat'  // 模块根目录，建议src/[module_id]
        },
        {
            id: 'chat-service',
            ssr: false,
            root: 'src/chat-service'
        }]
}
```
- 4 为每个远程模块创建代码文件，以chat为例:
  *src/chat/index.tsx*
  ```
import App from "./App"
import { getInitialProps } from 'bossjob-remote/dist/clientStorage'
import React from "react"
import { createRoot } from 'react-dom/client';

function render() {
    const props = getInitialProps('chat')
    const container = document.getElementById('chat');
    const root = createRoot(container);
    root.render(<App {...props} />);
}
render()
  ```
  如果启用ssr则改为:
   ```
import App from "./App"
import { getInitialProps } from 'bossjob-remote/dist/clientStorage'
import React from "react"
import { hydrateRoot } from 'react-dom/client';

function render() {
    const props = getInitialProps('chat')
    const container = document.getElementById('chat');
    hydrateRoot(container, <App {...props} />);
}
render()
  ```
  