#!/usr/bin/env node

import pico from 'picocolors'
import { Command } from 'commander'
import envinfo from 'envinfo'
import { checkNodeVersion, checkUpdate } from '@mango-scripts/utils'
import build from './scripts/build'
import dev from './scripts/dev'

const packageJson = require('../../package.json')

const { engines, name, version } = packageJson

checkNodeVersion(engines.node, name)
checkUpdate(packageJson)

const program = new Command()
program.version(`${name} ${version}`).usage('<command> [options]')

program
  .command('dev')
  .description('启动开发服务器')
  .option('-m --mode <mode>', '指定环境模式 (默认值：dev)', 'dev')
  .allowUnknownOption()
  .action((options) => {
    console.log('options', options)
    const { mode } = options

    dev(mode)

    // require('../src/updateLocale/index')(options)
  })

program
  .command('build')
  .description('构建打包应用')
  .option('-m --mode <mode>', '指定环境模式 (默认值：prod)', 'prod')
  .allowUnknownOption()
  .action((options) => {
    const { mode } = options

    build(mode)
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
          npmPackages: '/**/{typescript,*react*}'
        },
        {
          showNotFound: true,
          duplicates: true,
          fullTree: true
        }
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
  console.log(`  Run ${pico.cyan(`${name} <command> --help`)} for detailed usage of given command.`)
  console.log()
})

program.commands.forEach((c) => c.on('--help', () => console.log()))

program.parse(process.argv)
