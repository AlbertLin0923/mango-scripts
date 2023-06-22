import fs from 'fs-extra'
import pico from 'picocolors'
import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'

import getPaths from './getPaths'
import { defaultMode } from './mode'

import type { DefaultModeType } from './mode'

export const applyEnv = (mode: string) => {
  const paths = getPaths()

  if (defaultMode[mode as keyof DefaultModeType]) {
    Object.entries(defaultMode[mode as keyof DefaultModeType]).forEach(([key, value]) => {
      process.env[key] = value
    })
  }

  const dotenvFiles = [
    `${paths.dotenv}`,
    `${paths.dotenv}.${mode}`,
    `${paths.dotenv}.${mode}.local`
  ]

  dotenvFiles.forEach((dotenvFile) => {
    if (fs.existsSync(dotenvFile)) {
      dotenvExpand.expand(dotenv.config({ path: dotenvFile, override: true }))
    }
  })

  // console.log('process.env', process.env)

  const NODE_ENV = process.env.NODE_ENV

  if (!NODE_ENV) {
    throw new Error(
      pico.red('The NODE_ENV environment variable is required but was not specified.')
    )
  }
}

// Grab NODE_ENV and REACT_APP_* environment variables and prepare them to be
// injected into the application via DefinePlugin in webpack configuration.

export const getClientEnvironment = (publicUrl: string) => {
  const REACT_APP = /^REACT_APP_/i

  const raw = Object.keys(process.env)
    .filter((key) => REACT_APP.test(key))
    .reduce<Record<string, any>>(
      (env, key) => {
        env[key] = process.env[key]
        return env
      },
      {
        // Useful for determining whether we’re running in production mode.
        // Most importantly, it switches React into the correct mode.
        NODE_ENV: process.env.NODE_ENV || 'development',
        // Useful for resolving the correct path to static assets in `public`.
        // For example, <img src={process.env.PUBLIC_URL + '/img/logo.png'} />.
        // This should only be used as an escape hatch. Normally you would put
        // images into the `src` and `import` them in code to get their paths.
        PUBLIC_URL: publicUrl,
        // We support configuring the sockjs pathname during development.
        // These settings let a developer run multiple simultaneous projects.
        // They are used as the connection `hostname`, `pathname` and `port`
        // in webpackHotDevClient. They are used as the `sockHost`, `sockPath`
        // and `sockPort` options in webpack-dev-server.
        WDS_SOCKET_HOST: process.env.WDS_SOCKET_HOST,
        WDS_SOCKET_PATH: process.env.WDS_SOCKET_PATH,
        WDS_SOCKET_PORT: process.env.WDS_SOCKET_PORT
      }
    )

  // Stringify all values so we can feed into webpack DefinePlugin
  const stringified: { 'process.env': any } = {
    'process.env': Object.keys(raw).reduce<Record<string, any>>((env, key) => {
      env[key] = JSON.stringify(raw[key])
      return env
    }, {})
  }

  return { raw, stringified }
}
