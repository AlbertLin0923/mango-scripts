#!/usr/bin/env node
import { prepareCli, Command, pico, envinfo, gs } from '@mango-scripts/utils'

import webpackDev from './webpack/scripts/dev.mjs'
import webpackBuild from './webpack/scripts/build.mjs'
import webpackInspect from './webpack/scripts/inspect.mjs'
import rsbuildDev from './rsbuild/scripts/dev.mjs'
import rsbuildBuild from './rsbuild/scripts/build.mjs'
import rsbuildInspect from './rsbuild/scripts/inspect.mjs'

const { name, version } = prepareCli()

console.log(gs('@mango-scripts/react-scripts\n'))

const program = new Command()
program.version(`${name} ${version}`).usage('<command> [options]')

program
  .command('dev')
  .description('启动开发服务器')
  .option(
    '-m --mode <mode>',
    '指定环境模式 (默认值：development)',
    'development',
  )
  .option(
    '-b --bundler <bundler>',
    '指定底层构建工具 (默认值：webpack)',
    'webpack',
  )
  .allowUnknownOption()
  .action((options) => {
    const { mode, bundler } = options
    if (bundler === 'rsbuild') {
      rsbuildDev(mode)
    } else {
      webpackDev(mode)
    }
  })

program
  .command('build')
  .description('构建打包应用')
  .option('-m --mode <mode>', '指定环境模式 (默认值：production)', 'production')
  .option(
    '-b --bundler <bundler>',
    '指定底层构建工具 (默认值：webpack)',
    'webpack',
  )
  .allowUnknownOption()
  .action((options) => {
    const { mode, bundler } = options
    if (bundler === 'rsbuild') {
      rsbuildBuild(mode)
    } else {
      webpackBuild(mode)
    }
  })

program
  .command('inspect')
  .description('打印配置')
  .option('-m --mode <mode>', '指定环境模式 (默认值：production)', 'production')
  .option(
    '-b --bundler <bundler>',
    '指定底层构建工具 (默认值：webpack)',
    'webpack',
  )
  .allowUnknownOption()
  .action((options) => {
    const { mode, bundler } = options
    if (bundler === 'rsbuild') {
      rsbuildInspect(mode)
    } else {
      webpackInspect(mode)
    }
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
          npmPackages: '/**/{typescript,*react*}',
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
  console.log(pico.red(`Unknown command ${pico.yellow(cmd)}.`))
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
