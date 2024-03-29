import { fs, pico } from '@mango-scripts/utils'
import webpack from 'webpack'

import {
  printFileSizesAfterBuild,
  measureFileSizesBeforeBuild,
} from '../../common/utils/FileSizeReporter.mjs'
import formatWebpackMessages from '../../common/utils/formatWebpackMessages.mjs'
import printBuildError from '../../common/utils/printBuildError.mjs'
import checkRequiredFiles from '../../common/utils/checkRequiredFiles.mjs'
import { applyEnv } from '../../common/getEnv.mjs'
import { getPaths } from '../../common/getPaths.mjs'
import { getWebpackConfig } from '../config/webpack.config.mjs'
import { getUserConfig } from '../config/getUserConfig.mjs'

import type { Configuration } from 'webpack'
import type { PathsType } from '../../common/getPaths.mjs'

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', (err) => {
  throw err
})

interface webpackBuildResolveArgs {
  stats?: webpack.Stats | undefined
  warnings: string[]
}

// These sizes are pretty large. We'll warn for bundles exceeding them.
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024

const copyPublicFolder = async (paths: PathsType) => {
  await fs.copy(paths.appPublic, paths.appDist, {
    dereference: true,
    filter: (file) => file !== paths.appHtml,
  })
}

// Create the production build and print the deployment instructions.
const webpackBuild = async (config: Configuration) => {
  console.log(pico.cyan('Creating an optimized production build...'))

  const compiler = webpack(config)

  return new Promise<webpackBuildResolveArgs>((resolve, reject) => {
    compiler.run((err, stats) => {
      let messages
      if (err) {
        if (!err.message) {
          return reject(err)
        }

        let errMessage = err.message

        // Add additional information for postcss errors
        if (Object.prototype.hasOwnProperty.call(err, 'postcssNode')) {
          errMessage +=
            '\nCompileError: Begins at CSS selector ' +
            (err as any)['postcssNode'].selector
        }

        messages = formatWebpackMessages({
          errors: [errMessage],
          warnings: [],
        } as any)
      } else {
        messages = formatWebpackMessages(
          stats?.toJson({ all: false, warnings: true, errors: true }) as any,
        )
      }

      if (messages.errors.length) {
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        if (messages.errors.length > 1) {
          messages.errors.length = 1
        }
        return reject(new Error(messages.errors.join('\n\n')))
      }

      const resolveArgs = {
        stats,
        warnings: messages.warnings,
      }

      return resolve(resolveArgs)
    })
  })
}

const build = async (mode: string) => {
  try {
    const userConfig = await getUserConfig()
    const paths = getPaths(userConfig)

    // apply env
    applyEnv(mode, 'production', paths)

    // Warn and crash if required files are missing
    if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
      process.exit(1)
    }

    // First, read the current file sizes in build directory.
    // This lets us display how much they changed later.
    const previousFileSizes = await measureFileSizesBeforeBuild(paths.appDist)

    // Remove all content but keep the directory so that
    // if you're in it, you don't end up in Trash
    await fs.emptyDir(paths.appDist)

    // Merge with the public folder
    await copyPublicFolder(paths)

    try {
      const { stats, warnings } = await webpackBuild(
        getWebpackConfig(userConfig, paths),
      )

      if (warnings.length) {
        console.log(pico.yellow('Compiled with warnings.\n'))
        console.log(warnings.join('\n\n'))
        console.log(
          '\nSearch for the ' +
            pico.underline(pico.yellow('keywords')) +
            ' to learn more about each warning.',
        )
        console.log(
          'To ignore, add ' +
            pico.cyan('// eslint-disable-next-line') +
            ' to the line before.\n',
        )
      }

      console.log('File sizes after gzip:\n')
      printFileSizesAfterBuild(
        stats as any,
        previousFileSizes,
        paths.appDist,
        WARN_AFTER_BUNDLE_GZIP_SIZE,
        WARN_AFTER_CHUNK_GZIP_SIZE,
      )

      console.log()
    } catch (err: any) {
      console.log(pico.red('Failed to compile.\n'))
      printBuildError(err)
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
