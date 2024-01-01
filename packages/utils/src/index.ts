import path from 'node:path'
import { fileURLToPath } from 'node:url'

import fs from 'fs-extra'
import pico from 'picocolors'
import updateNotifier from 'update-notifier'
import gstring from 'gradient-string'
import consola from 'consola'
import inquirer from 'inquirer'
import envinfo from 'envinfo'
import CliTable from 'cli-table'
import { Command } from 'commander'
import { request } from 'undici'
import { glob } from 'glob'
import { execa } from 'execa'
import semver from 'semver'
import minimist from 'minimist'
import prompts from 'prompts'
import getGitRepoInfo from 'git-repo-info'
import fuzzypath from 'inquirer-fuzzy-path'
import inquirerPrompt from 'inquirer-autocomplete-prompt'
import open from 'open'
import dotenv from 'dotenv'
import { cosmiconfig } from 'cosmiconfig'
import dotenvExpand from 'dotenv-expand'
import { filesize } from 'filesize'
import recursiveReaddir from 'recursive-readdir'
inquirer.registerPrompt('fuzzypath', fuzzypath)
inquirer.registerPrompt('autocomplete', inquirerPrompt)

export {
  fs,
  pico,
  consola,
  inquirer,
  envinfo,
  CliTable,
  Command,
  request,
  glob,
  execa,
  getGitRepoInfo,
  semver,
  minimist,
  prompts,
  open,
  dotenv,
  dotenvExpand,
  cosmiconfig,
  filesize,
  recursiveReaddir,
}

export const checkNodeVersion = (wanted: string, name: string): void => {
  if (!semver.satisfies(process.version, wanted, { includePrerelease: true })) {
    console.log(
      pico.red(
        `You are using Node ${process.version} , but this version of ${name} requires Node ${wanted}.
           Please upgrade your Node version.`,
      ),
    )
    process.exit(1)
  }
}

export const checkUpdate = (pkg: any) => {
  updateNotifier({
    pkg,
    shouldNotifyInNpmScript: true,
  }).notify({
    message:
      'Update available ' +
      pico.dim('{currentVersion}') +
      pico.reset(' → ') +
      pico.green('{latestVersion}') +
      ' \nRun ' +
      pico.cyan(`pnpm update {packageName}@{latestVersion}`) +
      ' to update',
    defer: false,
  })
}

export const gs = (
  str: string,
  options = [
    { color: '#42d392', pos: 0 },
    { color: '#42d392', pos: 0.1 },
    { color: '#647eff', pos: 1 },
  ],
) => {
  if (process.stdout.isTTY && process.stdout.getColorDepth() > 8) {
    return gstring(options)(str)
  } else {
    return str
  }
}

export const prepareCli = (pathToPkg?: string): Record<string, any> => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const packageJson = fs.readJSONSync(
    path.resolve(__dirname, pathToPkg || '../../package.json'),
  )
  const { engines, name } = packageJson

  checkNodeVersion(engines.node, name)
  checkUpdate(packageJson)

  return packageJson
}
