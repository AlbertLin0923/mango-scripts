<h1 align="center">
@mango-scripts/dev-scripts
</h1>
<p align="center">
一些便捷的前端开发脚本
<p>
<p align="center">
<a href="https://www.npmjs.com/package/@mango-scripts/dev-scripts" target="__blank" rel="noopener noreferrer"><img src="https://img.shields.io/npm/v/@mango-scripts/dev-scripts?label=" alt="NPM version"></a>
<a href="https://www.npmjs.com/package/@mango-scripts/dev-scripts" target="__blank" rel="noopener noreferrer"><img src="https://img.shields.io/node/v/@mango-scripts/dev-scripts" alt="Node version"></a>
<a href="https://www.npmjs.com/package/@mango-scripts/dev-scripts" target="__blank" rel="noopener noreferrer"><img alt="NPM Downloads" src="https://img.shields.io/npm/dt/@mango-scripts/dev-scripts"></a>
<a href="./LICENSE" target="__blank" rel="noopener noreferrer"><img alt="License" src="https://img.shields.io/github/license/Albertlin0923/mango-scripts"></a>
</p>

## 安装

```bash
pnpm add @mango-scripts/dev-scripts -D
```

## 使用

在项目 `package.json` 的 `scripts` 增加脚本命令

### changeExtname

转换文件后缀名

```bash
dev-scripts changeExtname --input <dirPath> --output <dirPath> --originExt <string> --targetExt <string>
```

### addPackage

快捷添加多包仓库的子目录依赖包

```bash
dev-scripts addPackage --targetDirList [targetDirList...]
```

### copyDist

复制多包仓库的打包 dist 产物到根目录

```bash
dev-scripts copyDist --targetDirList [targetDirList...]
```

### gitGkd

一键切换、合并、推送目标分支

```bash
dev-scripts gitGkd --targetDirList [targetDirList...]
```

## License

[MIT](./LICENSE)
