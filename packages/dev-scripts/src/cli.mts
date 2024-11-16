#!/usr/bin/env node

import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  fs,
  gs,
  pico,
  envinfo,
  Command,
  prepareCli,
} from '@mango-scripts/utils'

import changeExtname from './scripts/changeExtname.mjs'
import addPackage from './scripts/addPackage.mjs'
import gitGkd from './scripts/gitGkd.mjs'
import releasePackage from './scripts/releasePackage/index.mjs'

const packageJson = fs.readJSONSync(
  path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../package.json',
  ),
)

const { name, version } = prepareCli(packageJson)

console.log(gs('@mango-scripts/dev-scripts\n'))

const program = new Command()
program.version(`${name} ${version}`).usage('<command> [options]')

program
  .command('changeExtname')
  .description('批量转换文件后缀名')
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
  .description('在Monorepo仓库模式下，快捷添加子目录依赖包')
  .option(
    '-t, --targetDirList [targetDirList...]',
    '需要添加依赖包的子目录列表',
    ['./apps', './packages'],
  )
  .allowUnknownOption()
  .action(() => {
    addPackage()
  })

program
  .command('releasePackage')
  .description('在Monorepo仓库模式下，发布npm包')
  .allowUnknownOption()
  .action(() => {
    releasePackage()
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
  console.log(`  ` + pico.red(`Unknown command ${pico.yellow(cmd)}.\n`))
  process.exitCode = 1
})

// add some useful info on help
program.on('--help', () => {
  console.log()
  console.log(
    `  Run ${pico.cyan(
      `${name} <command> --help`,
    )} for detailed usage of given command.\n`,
  )
})

program.commands.forEach((c) => c.on('--help', () => console.log()))

program.parse(process.argv)
