#!/usr/bin/env node

import path from 'node:path'
import { fileURLToPath } from 'node:url'

import fs from 'fs-extra'
import pico from 'picocolors'
import { Command } from 'commander'
import envinfo from 'envinfo'
import { checkNodeVersion, checkUpdate, gs } from '@mango-scripts/utils'

import changeExtname from './scripts/changeExtname.mjs'
import addPackage from './scripts/addPackage.mjs'
import copyDist from './scripts/copyDist.mjs'
import gitGkd from './scripts/gitGkd.mjs'
import releasePackage from './scripts/releasePackage/index.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const packageJson = fs.readJSONSync(
  path.resolve(__dirname, '../../package.json'),
)
const { engines, name, version } = packageJson

checkNodeVersion(engines.node, name)
checkUpdate(packageJson)

console.log(gs('@mango-scripts/dev-scripts'))

const program = new Command()
program.version(`${name} ${version}`).usage('<command> [options]')

program
  .command('changeExtname')
  .description('转换文件后缀名')
  .option('-i, --input <dirPath>', '输入目录路径')
  .option('-o, --output <dirPath>', '输出目录路径')
  .option('-r, --originExt <string>', '原始后缀名')
  .option('-t, --targetExt <string>', '目标后缀名')
  .allowUnknownOption()
  .action((options) => {
    changeExtname(options)
  })

program
  .command('addPackage')
  .description('快捷添加多包仓库的子目录依赖包')
  .option(
    '-t, --targetDirList [targetDirList...]',
    '需要添加依赖包的子目录列表',
    ['./apps', './packages'],
  )
  .allowUnknownOption()
  .action((options) => {
    addPackage(options)
  })

program
  .command('copyDist')
  .description('复制多包仓库的打包dist产物到根目录')
  .option(
    '-t, --targetDirList [targetDirList...]',
    '需要复制dist产物的子目录列表',
    ['./apps'],
  )
  .allowUnknownOption()
  .action((options) => {
    copyDist(options)
  })

program
  .command('gitGkd')
  .description('一键切换、合并、推送目标分支')
  .option(
    '-t, --targetBranch [targetBranch...]',
    '切换、合并、推送的目标分支',
    ['dev', 'test'],
  )
  .allowUnknownOption()
  .action((options) => {
    gitGkd(options)
  })

program
  .command('releasePackage')
  .description('发布Monorepo模式下的npm包')
  .allowUnknownOption()
  .action(() => {
    releasePackage()
  })

program
  .command('info')
  .description('打印运行环境参数')
  .action(() => {
    console.log(pico.bold('\nEnvironment Info:'))
    envinfo
      .run(
        {
          System: ['OS', 'CPU', 'Memory', 'Shell'],
          Binaries: ['Node', 'Yarn', 'npm'],
          Browsers: ['Chrome', 'Edge', 'Firefox', 'Safari'],
        },
        {
          showNotFound: true,
          duplicates: true,
          fullTree: true,
        },
      )
      .then(console.log)
  })

// output help information on unknown commands
program.on('command:*', ([cmd]) => {
  program.outputHelp()
  console.log(`  ` + pico.red(`Unknown command ${pico.yellow(cmd)}.`))
  console.log()
  process.exitCode = 1
})

// add some useful info on help
program.on('--help', () => {
  console.log()
  console.log(
    `  Run ${pico.cyan(
      `${name} <command> --help`,
    )} for detailed usage of given command.`,
  )
  console.log()
})

program.commands.forEach((c) => c.on('--help', () => console.log()))

program.parse(process.argv)
