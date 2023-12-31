import fs from 'fs-extra'
import { createRsbuild } from '@rsbuild/core'

import { applyEnv } from '../../common/getEnv.mjs'
import { getRsbuildConfig } from '../config/config.mjs'
import { getPaths } from '../../common/getPaths.mjs'
import { getUserConfig } from '../../webpack/config/getUserConfig.mjs'

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

    const config = await getRsbuildConfig({}, paths)

    const rsbuild = await createRsbuild({
      cwd: process.cwd(),
      rsbuildConfig: config,
    })

    await fs.emptyDir(paths.appDist)

    await rsbuild?.inspectConfig({
      verbose: true,
      outputPath: rsbuild.context.distPath,
      writeToDisk: true,
    })
  } catch (err: any) {
    if (err && err.message) {
      console.log(err.message)
    }
    process.exit(1)
  }
}

export default inspect
