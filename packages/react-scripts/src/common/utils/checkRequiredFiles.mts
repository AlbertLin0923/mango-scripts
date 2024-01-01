import path from 'node:path'

import { fs, pico } from '@mango-scripts/utils'

const checkRequiredFiles = (files: string[]): boolean => {
  const failFiles = files.filter((filePath) => {
    return !fs.pathExistsSync(filePath)
  })

  if (failFiles.length > 0) {
    console.log(`
${pico.red('Could not find required files: ')}
${failFiles.map((i) => `${pico.cyan(path.basename(i))}`).join('\n')}
${pico.red('Searched in: ')}
${failFiles.map((i) => `${pico.cyan(path.dirname(i))}`).join('\n')}
`)
    return false
  } else {
    return true
  }
}

export default checkRequiredFiles
