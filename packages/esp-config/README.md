<h1 align="center">
@mango-scripts/esp-config
</h1>
<p align="center">
一个包含 eslint，stylelint，prettier 的配置文件合集
<p>
<p align="center">
<a href="https://www.npmjs.com/package/@mango-scripts/esp-config" target="__blank" rel="noopener noreferrer"><img src="https://img.shields.io/npm/v/@mango-scripts/esp-config?label=" alt="NPM version"></a>
<a href="https://www.npmjs.com/package/@mango-scripts/esp-config" target="__blank" rel="noopener noreferrer"><img src="https://img.shields.io/node/v/@mango-scripts/esp-config" alt="Node version"></a>
<a href="https://www.npmjs.com/package/@mango-scripts/esp-config" target="__blank" rel="noopener noreferrer"><img alt="NPM Downloads" src="https://img.shields.io/npm/dt/@mango-scripts/esp-config"></a>
<a href="./LICENSE" target="__blank" rel="noopener noreferrer"><img alt="License" src="https://img.shields.io/github/license/Albertlin0923/mango-scripts"></a>
</p>

## 安装

```bash
pnpm add @mango-scripts/esp-config
```

## 使用

### .eslintrc.js

```js
module.exports = {
  extends: [require.resolve('@mango-scripts/esp-config/eslint')],
  rules: {
    // your rules
  }
}
```

### .stylelintrc.js

```js
module.exports = {
  extends: [require.resolve('@mango-scripts/esp-config/stylelint')],
  rules: {
    // your rules
  }
}
```

### .prettierrc.js

```js
const prettier = require('@mango-scripts/esp-config/prettier')

module.exports = {
  ...prettier
  // your rules
}
```

## License

[MIT](./LICENSE)
