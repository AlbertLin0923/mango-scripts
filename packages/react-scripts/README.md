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

- 基于 [react-scripts@5.0.1](https://github.com/facebook/create-react-app/tree/main/packages/react-scripts)，用 TypeScript + Pure ESM 改写
- 支持 `type:modules` ESM 模式
- 类似 [craco](https://github.com/dilanx/craco)，可通过配置文件对该构建工具进行扩展配置
- webpack 以及周边 loader、plugin 等相关依赖包保持及时的更新
- 内置 [esbuild](https://github.com/evanw/esbuild) 和 [swc](https://github.com/swc-project/swc) 配置支持，可切换 对应的 js/css minify 压缩器
- 内置 `less`、`scss`、`sass`、`stylus` CSS 预处理器
- 内置 [babel-plugin-jsx-css-modules](https://github.com/CJY0208/babel-plugin-jsx-css-modules) 插件，就像写普通 `css` 样式一样写 `css module` 模块化代码
- 内置 [webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer) 打包分析插件
- 内置 [svg-sprite-loader](https://github.com/JetBrains/svg-sprite-loader) svg 精灵图优化 loader
- 增加 [qiankun](https://github.com/umijs/qiankun) 配置支持
- 增加 [eslint-webpack-plugin](https://github.com/webpack-contrib/eslint-webpack-plugin) 和 [stylelint-webpack-plugin](https://github.com/webpack-contrib/stylelint-webpack-plugin)，默认读取业务项目目录的配置
- 可在开发环境下自动获取局域网 IP 并映射到地址栏，便于本地联调

## 安装

```bash
pnpm add @mango-scripts/react-scripts -D
```

> 注意：这是一个 [纯ESM包](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c#pure-esm-package)

## 使用

### 脚本命令

安装该库之后，你可以在 npm scripts 中以 `react-scripts` 或者从终端中以 `./node_modules/.bin/react-scripts` 访问这个命令。

推荐 npm scripts 如下：

```json
"scripts": {
  "dev": "react-scripts dev --mode development",
  "build:dev": "react-scripts build --mode dev",
  "build:test": "react-scripts build --mode test",
  "build:stage": "react-scripts build --mode stage",
  "build:prod": "react-scripts build --mode prod",
},
```

### 模式和环境变量

与`vue-cli`类似，`@mango-scripts/react-scripts` 支持`模式和环境变量`。

一般来说，一个项目有两个主要模式：

- development 模式：用于`本地开发环境`
- production 模式：用于`线上环境`

日常实际项目开发中，对于`线上环境`，往往需要区分`开发 / 测试 / 预发布 / 正式`，可通过不同模式进行区分。默认线上环境模式如下：

- dev 模式：用于`线上开发环境`
- test 模式：用于`线上测试环境`
- stage 模式：用于`线上预发布环境`
- prod 模式：用于`线上正式环境`

通过传递 --mode 模式选项，你可以加载对应的环境变量文件

例如：

1. 当运行 `react-scripts dev` 命令时，将依次读取并加载项目根目录下 `.env`、`.env.development`、 `.env.development.local` 的环境变量信息，后者同名变量会覆盖前者；

2. 当运行 `react-scripts build --mode stage` 命令时，将依次读取并加载项目根目录下 `.env`、`.env.production`、 `.env.stage`、`.env.stage.local` 的环境变量信息，后者同名变量会覆盖前者

### 扩展配置

项目根目录下新增 `mango.config.mjs` 配置文件

如：mango.config.mjs

```
import { defineConfig } from '@mango-scripts/react-scripts'

export default defineConfig({
  distDir: 'build',
  loader: {
    babel: {
      enable: true,
      options: {
        plugins: [
          [
            require.resolve('@babel/plugin-proposal-decorators'),
            {
              legacy: true,
            },
          ],
        ],
      },
    },
    less: {
      enable: true,
      options: {
        lessOptions: {
          modifyVars: {
            'brand-primary': '#975ec9',
            'brand-primary-tap': '#7e3db7',
            'switch-fill': '#975ec9',
          },
        },
      },
    },
    sass: {
      enable: true,
      options: {
        additionalData: `@import "src/styles/mixins.scss";`,
      },
    },
    stylus: {
      enable: true,
      options: {},
    },
    postcss: {
      enable: true,
      options: {},
    },
    swc: {
      enable: false,
      options: {},
    },
    esbuild: {
      enable: false,
      options: {},
    },
  },
  plugin: {
    eslint: {
      enable: true,
      options: {},
    },
    stylelint: {
      enable: true,
      options: {},
    },
    typescript: {
      enable: true,
      options: {},
    },
  },
  optimization: {
    splitChunks: {},
    minimizer: {
      jsMinimizer: {
        minify: 'terserMinify', // terserMinify | uglifyJsMinify | esbuildMinify | swcMinify
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
        },
      },
      cssMinimizer: {
        minify: 'cssnanoMinify', // cssnanoMinify | cssoMinify | cleanCssMinify | esbuildMinify  | lightningCssMinify | swcMinify
        minimizerOptions: {},
      },
    },
  },
})
```

## License

[MIT](./LICENSE)
