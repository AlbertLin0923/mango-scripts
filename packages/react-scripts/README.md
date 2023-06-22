<h1 align="center">
@mango-scripts/react-scripts
</h1>
<p align="center">
基于 react-scripts@5.0.1 添加一些功能和优化
<p>
<p align="center">
<a href="https://www.npmjs.com/package/@mango-scripts/react-scripts" target="__blank" rel="noopener noreferrer"><img src="https://img.shields.io/npm/v/@mango-scripts/react-scripts?label=" alt="NPM version"></a>
<a href="https://www.npmjs.com/package/@mango-scripts/react-scripts" target="__blank" rel="noopener noreferrer"><img src="https://img.shields.io/node/v/@mango-scripts/react-scripts" alt="Node version"></a>
<a href="https://www.npmjs.com/package/@mango-scripts/react-scripts" target="__blank" rel="noopener noreferrer"><img alt="NPM Downloads" src="https://img.shields.io/npm/dt/@mango-scripts/react-scripts"></a>
<a href="./LICENSE" target="__blank" rel="noopener noreferrer"><img alt="License" src="https://img.shields.io/github/license/Albertlin0923/mango-scripts"></a>
</p>

## 特性

- 基于 [react-scripts@5.0.1](https://github.com/facebook/create-react-app/tree/main/packages/react-scripts) ，用 TypeScript 改写
- webpack，babel，postcss 等依赖包保持及时的更新
- 可在开发环境下自动获取局域网 IP 并映射到地址栏，便于本地联调
- 内置 `scss、sass、less、stylus` 预处理器，无需再安装，并可扩展配置
- 内置 `babel-plugin-jsx-css-modules` 插件，就像写普通 css 样式一样写 css module 模块化代码
- 内置 `webpack-bundle-analyzer` 打包分析插件
- 内置 [svg-sprite-loader](https://juejin.cn/post/6844903517564436493) 配置支持
- 增加了 babel 扩展配置支持
- 增加了 [@umi/mfsu](https://umijs.org/blog/mfsu-faster-than-vite) 缓存支持
- 增加了 [qiankun](https://github.com/umijs/qiankun) 配置支持
- 代码压缩打包支持使用 [esbuild](https://github.com/webpack-contrib/terser-webpack-plugin#esbuild) 或者 [swc](https://github.com/webpack-contrib/terser-webpack-plugin#esbuild)

## 安装

```bash
pnpm add @mango-scripts/react-scripts
```

## 使用

### 脚本命令

安装该库之后，你可以在 npm scripts 中以 react-scripts 或者从终端中以 ./node_modules/.bin/react-scripts 访问这个命令。

推荐 npm scripts 如下：

```json
"scripts": {
  "dev": "react-scripts dev --mode dev",
  "build:test": "react-scripts build --mode test",
  "build:stage": "react-scripts build --mode stage",
  "build:prod": "react-scripts build --mode prod",
},
```

### 模式和环境变量

与`vue-cli`类似，`@mango-scripts/react-scripts` 支持`模式和环境变量`。

默认情况下，一个项目有四个模式：

- dev 模式：用于`项目本地开发环境`
- test 模式：用于`项目测试环境`
- stage 模式：用于`项目预发布环境`
- prod 模式：用于`项目正式环境`

通过传递 --mode 模式选项，你可以加载对应的环境变量文件

例如：

```bash
react-scripts dev --mode dev
```

当运行 react-scripts 命令时，将读取项目根目录下的 `env.dev` 和 `env.dev.local` (可选)，并加载到项目中

### 启用功能

在上一步配置了`mode`模式后，你可通过配置`环境变量`的方式启用`@mango-scripts/react-scripts`的特性

默认`dev`环境变量

```bash
# nodejs 运行环境
NODE_ENV: 'development',

# babel 运行环境
BABEL_ENV: 'development',

# 项目环境标识，可在业务项目代码通过 process.env.REACT_APP_ENV 访问
REACT_APP_ENV: 'dev',

# 是否使用HTTPS启动dev-server
USE_HTTPS: 'false',

# HTTPS证书路径
SSL_CRT_FILE_PATH: '',

# HTTPS证书路径
SSL_KEY_FILE_PATH: '',

# 是否使用TailWind
USE_TAILWIND: 'false',

# 是否使用react热更新
USE_FAST_REFRESH: 'true',

# 是否使用 mfsu
USE_MFSU: 'false',

# 图片压缩限定值
IMAGE_INLINE_SIZE_LIMIT: '10000',

# 是否构建阶段使用eslint插件
USE_ESLINT_PLUGIN: 'false',


# 开发环境端口
PORT: '',
WDS_SOCKET_HOST: '',
WDS_SOCKET_PATH: '',
WDS_SOCKET_PORT: ''
```

### 扩展配置

#### 扩展 babel 配置

项目根目录下新增 `babel.config.js` / `.babelrc.js` / `.babelrc`配置文件，脚本会自动读取合并 babel 配置到 babel-loader

babel.config.js

```js
module.exports = {
  plugins: [
    [
      require.resolve('@babel/plugin-proposal-decorators'),
      {
        legacy: true
      }
    ],
    ...
  ]
}
```

#### 扩展 less、sass、stylus 预处理器配置

项目根目录下新增 `preProcessor.config.js` / `.preProcessorrc.js` / `.preProcessorrc` 配置文件，脚本会自动读取配置合并到对应的预处理器 loader

preProcessor.config.js

```js
const path = require('path')

module.exports = {
  'less-loader': {
    lessOptions: {
      modifyVars: {
        'brand-primary': '#975ec9',
        'brand-primary-tap': '#7e3db7',
        'switch-fill': '#975ec9'
      },
      javascriptEnabled: true,
      paths: [path.resolve(__dirname, 'node_modules'), path.resolve(__dirname, 'src')]
    }
  },
  'sass-loader': {
    additionalData: `@import "src/styles/mixins.scss";`
  }
}
```

## License

[MIT](./LICENSE) License © 2022-Present [AlbertLin](https://github.com/AlbertLin0923)
