import semver from 'semver'
import pico from 'picocolors'
import updateNotifier from 'update-notifier'
import gstring from 'gradient-string'
import logger from './logger'

export { logger }

export const checkNodeVersion = (wanted: string, name: string): void => {
  if (!semver.satisfies(process.version, wanted, { includePrerelease: true })) {
    console.log(
      pico.red(
        `You are using Node ${process.version} , but this version of ${name} requires Node ${wanted}.
           Please upgrade your Node version.`
      )
    )
    process.exit(1)
  }
}

export const checkUpdate = (pkg: any) => {
  updateNotifier({
    pkg,
    shouldNotifyInNpmScript: true,
    updateCheckInterval: 0
  }).notify({
    message:
      'Update available ' +
      pico.dim('{currentVersion}') +
      pico.reset(' → ') +
      pico.green('{latestVersion}') +
      ' \nRun ' +
      pico.cyan(`pnpm update {packageName}@{latestVersion}`) +
      ' to update',
    defer: false
  })
}

export const gs = (
  str: string,
  options = [
    { color: '#42d392', pos: 0 },
    { color: '#42d392', pos: 0.1 },
    { color: '#647eff', pos: 1 }
  ]
) => {
  if (process.stdout.isTTY && process.stdout.getColorDepth() > 8) {
    return gstring(options)(str)
  } else {
    return str
  }
}
