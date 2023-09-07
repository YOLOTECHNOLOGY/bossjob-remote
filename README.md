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
            id: 'third',  // 模块唯一id
            ssr: true,    // 是否启用服务端渲染
            root: 'src/third' // 模块根目录，建议src/[module_id]
        },
        {
            id: 'chat',
            ssr: false,
            root: 'src/chat'
        },
        {
            id: 'chat-service',
            ssr: false,
            root: 'src/chat-service'
        }]
}
```