<h1 align="center">
@mango-scripts/i18n-scripts
</h1>
<p align="center">
<a href="https://github.com/AlbertLin0923/mango-i18n-system" target="__blank" rel="noopener noreferrer">mango-i18n-system</a> 自动国际化文案配置系统的辅助插件合集，用于下载语言包、转换vue文件等
<p>
<p align="center">
<a href="https://www.npmjs.com/package/@mango-scripts/i18n-scripts" target="__blank" rel="noopener noreferrer"><img src="https://img.shields.io/npm/v/@mango-scripts/i18n-scripts?label=" alt="NPM version"></a>
<a href="https://www.npmjs.com/package/@mango-scripts/i18n-scripts" target="__blank" rel="noopener noreferrer"><img src="https://img.shields.io/node/v/@mango-scripts/i18n-scripts" alt="Node version"></a>
<a href="https://www.npmjs.com/package/@mango-scripts/i18n-scripts" target="__blank" rel="noopener noreferrer"><img alt="NPM Downloads" src="https://img.shields.io/npm/dt/@mango-scripts/i18n-scripts"></a>
<a href="./LICENSE" target="__blank" rel="noopener noreferrer"><img alt="License" src="https://img.shields.io/github/license/Albertlin0923/mango-scripts"></a>
</p>

## 安装

```bash
pnpm add @mango-scripts/i18n-scripts -D
```

> 注意：这是一个 [纯ESM包](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c#pure-esm-package)

## 使用

在项目 `package.json` 的 `scripts` 增加脚本命令

### updateLocale

从国际化文案配置系统下载语言包文件并进行对比和梳理

```json
{
  "scripts": {
    "updateLocale": "i18n-scripts updateLocale --address <url> --output <dirPath> --localeList <locale...>"
  }
}
```

```
Options:
  -a, --address <url>           国际化文案配置系统接口地址
  -o, --output <dirPath>        语言包的存放目录路径
  -l, --localeList [locale...]  需要下载的语言包列表
```

例如：

```
{
  "scripts": {
    "updateLocale": "i18n-scripts updateLocale --address http://xxx:5003/api/locale/get_locale_map --output ./src/locales/common/ --localeList zh-CN en-US id-ID"
  }
}
```

### insertI18n

给 `vue` 文件添加 `$t('xxx')` 国际化 i18n 标识

```json
{
  "scripts": {
    "insertI18n": "i18n-scripts insertI18n --input <dirPath> --output <dirPath> --localeModulesStr <string>"
  }
}
```

```
Options:
  -i, --input <dirPath>            输入目录路径
  -o, --output <dirPath>           输出目录路径
  -l, --localeModulesStr <string>  国际化文案模块字段
```

例如：

```json
{
  "scripts": {
    "insertI18n": "i18n-scripts insertI18n --input ./src/source -output ./src/target -localeModulesStr 需求1"
  }
}
```

## License

[MIT](./LICENSE)
