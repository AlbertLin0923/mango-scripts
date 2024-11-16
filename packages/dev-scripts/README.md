<h1 align="center">
@mango-scripts/dev-scripts
</h1>
<p align="center">
一些便捷的前端开发脚本，支持快捷发布 npm 包、批量转换文件后缀名、git 快捷操作等
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

> 注意：这是一个 [纯ESM包](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c#pure-esm-package)

## 使用

在项目 `package.json` 的 `scripts` 增加脚本命令

### releasePackage

在 Monorepo 仓库模式下，快捷发布 npm 包

```bash
dev-scripts releasePackage
```

### addPackage

在 Monorepo 仓库模式下，快捷添加子目录依赖包

```bash
dev-scripts addPackage --targetDirList [targetDirList...]
```

### changeExtname

批量转换文件后缀名

```bash
dev-scripts changeExtname --input <dirPath> --output <dirPath> --originExt <string> --targetExt <string>
```

### gitGkd

一键切换、合并、推送目标分支

```bash
dev-scripts gitGkd --targetBranch [targetBranch...]
```

## License

[MIT](./LICENSE)
