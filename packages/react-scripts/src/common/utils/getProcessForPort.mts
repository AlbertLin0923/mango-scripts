import { execFileSync } from 'node:child_process'
import path from 'node:path'

import { pico } from '@mango-scripts/utils'

import { require } from './index.mjs'

const execOptions: any = {
  encoding: 'utf8',
  stdio: ['pipe', 'pipe', 'ignore'],
}

function isProcessAReactApp(processCommand: string): boolean {
  return /^node .*react-scripts\/scripts\/start\.js\s?$/.test(processCommand)
}

function getProcessIdOnPort(port: number): string {
  return execFileSync(
    'lsof',
    ['-i:' + port, '-P', '-t', '-sTCP:LISTEN'],
    execOptions,
  )
    .split('\n')[0]
    .trim()
}

function getPackageNameInDirectory(directory: string): string | null {
  const packagePath = path.join(directory.trim(), 'package.json')

  try {
    return require(packagePath).name
  } catch (e) {
    return null
  }
}

function getProcessCommand(
  processId: string,
  processDirectory: string,
): string {
  let command = execFileSync(
    'ps -o command -p ' + processId + ' | sed -n 2p',
    execOptions,
  )

  command = command.replace(/\n$/, '')

  if (isProcessAReactApp(command)) {
    const packageName = getPackageNameInDirectory(processDirectory)
    return packageName ? packageName : command
  } else {
    return command
  }
}

function getDirectoryOfProcessById(processId: string): string {
  return execFileSync(
    'lsof -p ' +
      processId +
      ' | awk \'$4=="cwd" {for (i=9; i<=NF; i++) printf "%s ", $i}\'',
    execOptions,
  ).trim()
}

function getProcessForPort(port: number): string | null {
  try {
    const processId = getProcessIdOnPort(port)
    const directory = getDirectoryOfProcessById(processId)
    const command = getProcessCommand(processId, directory)
    return (
      pico.cyan(command) +
      pico.white(' (pid ' + processId + ')\n') +
      pico.blue('  in ') +
      pico.cyan(directory)
    )
  } catch (e) {
    return null
  }
}

export default getProcessForPort
