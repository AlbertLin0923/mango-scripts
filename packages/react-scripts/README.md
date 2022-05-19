
# @mango-scripts/react-scripts

基于 [react-scripts@5.0.1](https://github.com/facebook/create-react-app/tree/main/packages/react-scripts) 添加一些功能和优化

- 开发环境下自动获取局域网IP，便于本地联调
- 增加了 babel 配置支持
- 增加了 @umi/mfsu 缓存支持
- 增加了 antd 配置支持
- 增加了 less 配置支持，内置了less，less-loader ，无需再安装
- 增加了 [qiankun](https://github.com/umijs/qiankun) 配置支持
- 增加了 svg-sprite-loader 配置支持
- 增加了 webpack-bundle-analyzer 配置支持
- eslint-config-react-app 改为 peerDependencies, 提升到项目顶级安装，方便使用pnpm时,无需扁平化处理依赖
- 代码压缩打包支持使用esbuild or swc


## 需要业务项目按照 eslint-config-react-app
`pnpm i eslint-config-react-app@7.0.1`

## babel 配置
项目根目录下新增 `babel.config.js`, `.babelrc.js`, `.babelrc`配置文件,脚本会自动读取合并babel配置到babel-loader options


## 开启 @umi/mfsu 支持
`cross-env USE_MFSU=true react-scripts start`


##  开启 qiankun 配置
`cross-env USE_QIANKUN=true react-scripts start`
`cross-env USE_QIANKUN=true react-scripts build`


## 开启 webpack-bundle-analyzer 显示
`cross-env USE_ANALYZE=true react-scripts build`


## 使用pnpm 情况下，偶尔会发生eslint错误，提示未找到配置options，这时候需要禁用 eslint plugin
`cross-env DISABLE_ESLINT_PLUGIN=true react-scripts start`
`cross-env DISABLE_ESLINT_PLUGIN=true react-scripts build`

## 开启 esbuild 打包压缩
`cross-env USE_ESBUILD=true react-scripts build`

## 开启 SWC 打包压缩
`cross-env USE_SWC=true react-scripts build`


