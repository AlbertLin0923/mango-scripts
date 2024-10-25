#!/usr/bin/env node
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  fs,
  gs,
  prepareCli,
  pico,
  envinfo,
  Command,
} from '@mango-scripts/utils'

import updateLocale from './scripts/updateLocale.mjs'
import insertI18n from './scripts/insertI18n.mjs'

const packageJson = fs.readJSONSync(
  path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../package.json',
  ),
)
const { name, version } = prepareCli(packageJson)

console.log(gs('@mango-scripts/i18n-scripts'))

const program = new Command()
program.version(`${name} ${version}`).usage('<command> [options]')

program
  .command('updateLocale')
  .description('从国际化文案配置系统下载语言包文件并进行对比和梳理')
  .option('-a, --address <url>', '国际化文案配置系统接口地址')
  .option('-o, --output <dirPath>', '语言包的存放目录路径')
  .option('-l, --localeList [locale...]', '需要下载的语言包列表')
  .allowUnknownOption()
  .action((options) => {
    updateLocale(options)
  })

program
  .command('insertI18n')
  .description('给 vue 文件添加国际化 i18n 标识')
  .option('-i, --input <dirPath>', '输入目录路径')
  .option('-o, --output <dirPath>', '输出目录路径')
  .option('-l, --localeModulesStr <string>', '国际化文案模块字段')
  .allowUnknownOption()
  .action((options) => {
    insertI18n(options)
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
