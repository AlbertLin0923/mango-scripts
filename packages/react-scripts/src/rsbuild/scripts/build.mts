import { createRsbuild, logger } from '@rsbuild/core'

import { getPaths } from '../../common/getPaths.mjs'
import { applyEnv } from '../../common/getEnv.mjs'
import { getRsbuildConfig } from '../config/config.mjs'
import { getUserConfig } from '../../webpack/config/getUserConfig.mjs'

process.on('unhandledRejection', (err) => {
  throw err
})

const build = async (mode: string) => {
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

    try {
      await rsbuild.build()
    } catch (err) {
      logger.error('Failed to compile.\n')
      logger.error(err)
      process.exit(1)
    }
  } catch (err: any) {
    if (err && err.message) {
      console.log(err.message)
    }
    process.exit(1)
  }
}

export default build
