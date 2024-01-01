import { pico } from '@mango-scripts/utils'
import { createRsbuild } from '@rsbuild/core'

import choosePort from '../../common/utils/choosePort.mjs'
import checkRequiredFiles from '../../common/utils/checkRequiredFiles.mjs'
import { getLocalHost } from '../../common/utils/index.mjs'
import { applyEnv } from '../../common/getEnv.mjs'
import { getPaths } from '../../common/getPaths.mjs'
import { getRsbuildConfig } from '../config/config.mjs'
import { getUserConfig } from '../../webpack/config/getUserConfig.mjs'

process.on('unhandledRejection', (err) => {
  throw err
})

const dev = async (mode: string) => {
  try {
    const userConfig = await getUserConfig()
    const paths = getPaths(userConfig)

    // apply env
    applyEnv(mode, 'development', paths)

    // Warn and crash if required files are missing
    if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
      process.exit(1)
    }

    const useLocalHost = process.env.USE_LOCAL_HOST === 'true'

    const defaultPort = Number(process.env.PORT || '3000')
    const host = (useLocalHost && getLocalHost()) || '0.0.0.0'

    // We attempt to use the default port but if it is busy, we offer the user to
    // run on a different port. `choosePort()` Promise resolves to the next free port.
    const port = await choosePort(host, defaultPort)

    if (port == null) {
      // We have not found a port.
      console.log(pico.red('No port found, please check your environment'))
      return
    }

    const config = await getRsbuildConfig(
      {
        server: {
          host,
          port,
        },
      },
      paths,
    )

    const rsbuild = await createRsbuild({
      cwd: process.cwd(),
      rsbuildConfig: config,
    })
    const { server: devServer } = await rsbuild.startDevServer()

    ;['SIGINT', 'SIGTERM'].forEach((sig) => {
      process.on(sig, () => {
        devServer.close()
        process.exit()
      })
    })

    if (process.env.CI !== 'true') {
      // Gracefully exit when stdin ends
      process.stdin.on('end', () => {
        devServer.close()
        process.exit()
      })
    }
  } catch (err: any) {
    if (err && err.message) {
      console.log(err.message)
    }
    process.exit(1)
  }
}

export default dev
