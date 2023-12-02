import path from 'path'

import { transformFileSync } from '@babel/core'

const output = transformFileSync(
  path.join(__dirname, './sourceCode/input.tsx'),
  {
    presets: null,
    plugins: [[require.resolve('../src/index.ts')]],
    parserOpts: {
      sourceType: 'unambiguous',
      plugins: ['jsx', 'typescript'],
    },
    babelrc: false,
    configFile: false,
  },
)?.code

console.log(output)
