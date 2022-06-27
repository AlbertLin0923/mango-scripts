const fs = require('fs-extra')
const path = require('path')
const { extractChineseFieldList } = require('../dist/cjs/index')
const projectPath = path.resolve(__dirname, './sourceCode/')

const sourceCodeContentHashMapPath = path.resolve(
  __dirname,
  './contentHash/source-code-content-hash-map.json'
)

async function bootstrap() {
  await fs.emptyDir(path.resolve(__dirname, './contentHash/'))
  const result = await extractChineseFieldList(
    [projectPath],
    ['.jsx'],
    sourceCodeContentHashMapPath,
    'ast'
  )
  console.log('result', result)
}

try {
  bootstrap()
} catch (error) {
  console.log(error)
}
