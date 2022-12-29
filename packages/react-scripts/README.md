# @mango-scripts/react-scripts

基于 [react-scripts@5.0.1](https://github.com/facebook/create-react-app/tree/main/packages/react-scripts) 添加一些功能和优化

- 可在开发环境下自动获取局域网 IP，便于本地联调
- eslint-config-react-app 改为 peerDependencies, 提升到项目顶级安装，方便使用 pnpm 时,无需扁平化处理依赖
- 增加了 babel 配置支持
- 增加了 @umi/mfsu 缓存支持
- 增加了 antd 配置支持
- 内置 less,stylus ，无需再安装，支持 `sass/less/stylus` 预处理器配置支持
- 增加了 [qiankun](https://github.com/umijs/qiankun) 配置支持
- 增加了 svg-sprite-loader 配置支持
- 增加了 webpack-bundle-analyzer 配置支持
- 代码压缩打包支持使用 [esbuild](https://github.com/webpack-contrib/terser-webpack-plugin#esbuild) 或者 [swc](https://github.com/webpack-contrib/terser-webpack-plugin#esbuild)

需要业务项目安装 eslint-config-react-app 依赖包

`pnpm i eslint-config-react-app@7.0.1`

使用 pnpm 情况下，偶尔会发生 eslint 错误，提示未找到配置 options，这时候需要禁用 eslint plugin

`cross-env DISABLE_ESLINT_PLUGIN=true react-scripts start` `cross-env DISABLE_ESLINT_PLUGIN=true react-scripts build`

## 开启 开发环境下自动获取本地 ip

`cross-env USE_LOCAL_HOST=true react-scripts start`

## 自定义 babel 配置支持

项目根目录下新增 `babel.config.js`, `.babelrc.js`, `.babelrc`配置文件,脚本会自动读取合并 babel 配置到 babel-loader options

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
    ['babel-plugin-import', { libraryName: 'antd-mobile', style: true }]
  ]
}
```

## 自定义 css 预处理器配置支持

项目根目录下新增 `preProcessor.config.js`, `.preProcessorrc.js`, `.preProcessorrc`配置文件,脚本会自动读取配置合并到预处理 options

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
  }
}
```

## 开启 @umi/mfsu 支持

`cross-env USE_MFSU=true react-scripts start`

## 开启 qiankun 配置

`cross-env USE_QIANKUN=true react-scripts start` `cross-env USE_QIANKUN=true react-scripts build`

## 开启 webpack-bundle-analyzer 显示

`cross-env USE_ANALYZE=true react-scripts build`

## 开启 esbuild 打包压缩

`cross-env USE_ESBUILD=true react-scripts build`

## 开启 SWC 打包压缩

`cross-env USE_SWC=true react-scripts build`
