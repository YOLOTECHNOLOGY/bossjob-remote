# Bossjob 远程模块构建连接库
## 创建远程模块
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
```
// src/chat/index.tsx
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
// src/chat/index.tsx
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
界面主节点:

```
// src/chat/App.tsx
import React, { useState } from 'react';

function App() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  )
}

export default App
```
为每个module创建一个html入口文件: src/chat/index.html

```
<!doctype html>
<html >
  <head>
    <meta charset="UTF-8" />
  </head>
  <body>
    <div id="chat"></div>
    <script type="module" src="/src/chat/index.tsx"></script>
  </body>
</html>
```
如果使用了ssr 还需添加服务器文件用于编译:
```
// src/chat/renderer.js
import  { default as serverRenderer} from 'bossjob-remote/dist/serverRenderer'

export default serverRenderer
```
开发模式则添加:
```
// src/chat/renderer-dev.js
import  { default as serverRenderer} from 'bossjob-remote/dist/serverRenderer-dev'

export default serverRenderer
```
在命令行中执行编译:

```
bossjob build
```
完成编译后启动服务:

```
bossjob start
```
## 连接远程模块

- 1 主工程中安装bossjob-remote:
```
yarn add bossjob-remote
```
- 2 配置连接器，以next为例
```
// helpers/bossjobRemoteClient
import { getClient } from 'bossjob-remote/dist/client'
import Script from 'next/script'

const client = getClient({
    parseScript: (script, baseUrl) => {
        return <Script
            key={script.src + script.textContent}
            type="module"
            async
            crossOrigin={'anonymous'}
            src={script.src ? `${baseUrl}${script.src}` : undefined}>
            {script?.textContent?.replaceAll('\n', ';') ?? ''}
        </Script>
    },
    parseLink: (link, baseUrl) => <link
        key={link.href}
        rel={link.rel}
        href={`${baseUrl}${link.href}`}>
    </link>
})

export default client
```
- 3 在页面的根layout中连接远程模块，可在同一页面连接多个模块，以chat，third为例，其中third为ssr模块

```
app/(chat-page)/layout.tsx
import bossjobClient from 'helpers/bossjobRemoteClient'

export default async function PublicLayout(props: any) {
  const config = { }
  const lang = ''
  const chatDictionary = { chat: {}}
  const userDetail = {}
  const data = {
    config,
    lang,
    chatDictionary: dictionary?.chat ?? {},
    chat_id,
    userDetail: userDetailRes?.data?.data
  }
  const chatModule = await bossjobClient.connectModule({
    id: 'chat',
    baseUrl: 'http://localhost:3000',
    initialProps: data,       // 传给远程组件初始化的props
    initalSharedData: {        
      CHAT_ID: +chat_id ? chat_id : null,
    }
  })
  const thirdModule = await bossjobClient.connectModule({
    id: 'third',
    baseUrl: 'http://localhost:3000',
    ssr: true
  })

  return (
    <html lang={lang} translate='no'>
      <head >
        {chatModule.inHead}
        {thirdModule.inHead}
      </head>
      <body >
        {thirdModule.inBody}
        {chatModule.inBody}
        <div id='next-app'>
          {thirdModule.component}
          {chatModule.component}
          {children}
        </div>
      </body>
    </html>
  )
}

```
