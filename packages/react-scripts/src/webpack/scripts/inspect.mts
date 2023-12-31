import path from 'node:path'

import fs from 'fs-extra'
import pico from 'picocolors'

import { getPaths } from '../../common/getPaths.mjs'
import { applyEnv } from '../../common/getEnv.mjs'
import { getWebpackConfig } from '../config/webpack.config.mjs'
import { getUserConfig } from '../config/getUserConfig.mjs'

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', (err) => {
  throw err
})

const inspect = async (mode: string) => {
  try {
    const userConfig = await getUserConfig()
    const paths = getPaths(userConfig)

    // apply env
    applyEnv(mode, 'production', paths)

    const config = getWebpackConfig(userConfig, paths)

    await fs.emptyDir(paths.appDist)

    const webpackConfigPath = path.join(paths.appDist, './webpack.config.js')

    fs.writeFile(webpackConfigPath, `const config = ${JSON.stringify(config)}`)

    console.log(
      pico.cyan(`
    Inspect config succeed, open following files to view the content:

    Webpack Config File Path: ${webpackConfigPath}
    `),
    )
  } catch (err: any) {
    if (err && err.message) {
      console.log(err.message)
    }
    process.exit(1)
  }
}

export default inspect
