import path from 'node:path'

import { extractChineseFieldList } from '../dist/esm/index.mjs'

async function bootstrap() {
  const result = await extractChineseFieldList(
    'ast',
    [path.resolve(process.cwd(), './sourceCode/')],
    ['.jsx', '.vue'],
  )
  console.log('result', result)
}

try {
  bootstrap()
} catch (error) {
  console.log(error)
}
