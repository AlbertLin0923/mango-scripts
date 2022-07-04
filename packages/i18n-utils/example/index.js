const path = require('path')
const { extractChineseFieldList } = require('../dist/cjs/index')
const projectPath = path.resolve(__dirname, './sourceCode/')

async function bootstrap() {
  const result = await extractChineseFieldList('ast', [projectPath], ['.jsx', '.vue'])
  console.log('result', result)
}

try {
  bootstrap()
} catch (error) {
  console.log(error)
}
