# @mango-scripts/esp-config

![npm (scoped)](https://img.shields.io/npm/v/@mango-scripts/esp-config) ![node-current (scoped)](https://img.shields.io/node/v/@mango-scripts/esp-config) ![GitHub](https://img.shields.io/github/license/Albertlin0923/mango-scripts) ![npm](https://img.shields.io/npm/dt/@mango-scripts/esp-config)

`eslint`，`stylelint`，`prettier` 通用配置规则包

## 安装

```bash
pnpm i @mango-scripts/esp-config
```

## 使用

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
}
```
