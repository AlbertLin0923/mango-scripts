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
pnpm add @mango-scripts/esp-config -D
```

## 使用

### .eslintrc.js

```js
module.exports = {
  extends: [require.resolve('@mango-scripts/esp-config/eslint')],
  rules: {
    // your rules
  },
}
```

### stylelint.config.mjs

```mjs
import stylelint from '@mango-scripts/esp-config/stylelint'

/** @type {import("stylelint").Config} */
const config = {
  ...stylelint,
  rules: {
    // your rules
  },
}

export default config
```

### prettier.config.mjs

```mjs
import prettier from '@mango-scripts/esp-config/prettier'

/** @type {import("prettier").Config} */
const config = {
  ...prettier,
  // your rules
}

export default config
```

## License

[MIT](./LICENSE)
