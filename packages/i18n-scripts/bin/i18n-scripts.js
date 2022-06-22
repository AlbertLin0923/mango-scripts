#!/usr/bin/env node

// Check node version before requiring/doing anything else
// The user may be on a very old node version
const semver = require('semver')
const pico = require('picocolors')
const requiredNodeVersion = require('../package.json').engines.node
const cliName = require('../package.json').name

function checkNodeVersion(wanted, id) {
  if (!semver.satisfies(process.version, wanted, { includePrerelease: true })) {
    console.log(
      pico.red(
        `You are using Node ${process.version} , but this version of ${id} requires Node ${wanted}.
         Please upgrade your Node version.`
      )
    )
    process.exit(1)
  }
}

checkNodeVersion(requiredNodeVersion, cliName)

// Notify update when process exits
const updater = require('update-notifier')
const pkg = require('../package.json')
// Checks for available update and returns an instance
const notifier = updater({
  pkg,
  shouldNotifyInNpmScript: true,
  updateCheckInterval: 0,
  defer: false
})

notifier.notify({
  message:
    'Update available ' +
    pico.dim('{currentVersion}') +
    pico.reset(' → ') +
    pico.green('{latestVersion}') +
    ' \nRun ' +
    pico.cyan(`pnpm update {packageName}@{latestVersion}`) +
    ' to update'
})

const leven = require('leven')
const program = require('commander')
const envinfo = require('envinfo')

program.version(`${cliName} ${require('../package').version}`).usage('<command> [options]')

program
  .command('updateLocale')
  .description('从国际化文案配置系统下载翻译文件并进行对比和梳理')
  .option('-f, --fromAddress <fromAddress>', '国际化文案配置系统接口地址')
  .option('-o, --output <dirPath>', '语言包存放目录路径')
  .option('-l, --localeList [localeList...]', '需要下载的语言包列表')
  .allowUnknownOption()
  .action((options) => {
    require('../src/updateLocale/index')(options)
  })

program
  .command('insertI18n')
  .description('转换插入i18n')
  .option('-i, --input <dirPath>', '待转换文件的目录路径')
  .option('-o, --output <dirPath>', '转换后生成文件存储的目录路径')
  .option('-t, --translateModulesStr <string>', '翻译模块字段')
  .allowUnknownOption()
  .action((options) => {
    require('../src/insertI18n/index')(options)
  })

program
  .command('jsTojsx')
  .description('批量重命名js文件到jsx文件')
  .option('-i, --input <dirPath>', '待转换文件的目录路径')
  .option('-o, --output <dirPath>', '转换后生成文件存储的目录路径')
  .allowUnknownOption()
  .action((options) => {
    require('../src/jsTojsx/index')(options)
  })

program
  .command('info')
  .description('print debugging information about your environment')
  .action(() => {
    console.log(pico.bold('\nEnvironment Info:'))
    envinfo
      .run(
        {
          System: ['OS', 'CPU'],
          Binaries: ['Node', 'Yarn', 'npm'],
          Browsers: ['Chrome', 'Edge', 'Firefox', 'Safari'],
          npmPackages: '/**/{typescript,*vue*,@vue/*/}'
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
  suggestCommands(cmd)
  process.exitCode = 1
})

// add some useful info on help
program.on('--help', () => {
  console.log()
  console.log(
    `  Run ${pico.cyan(`${cliName} <command> --help`)} for detailed usage of given command.`
  )
  console.log()
})

program.commands.forEach((c) => c.on('--help', () => console.log()))

program.parse(process.argv)

function suggestCommands(unknownCommand) {
  const availableCommands = program.commands.map((cmd) => cmd._name)

  let suggestion

  availableCommands.forEach((cmd) => {
    const isBestMatch = leven(cmd, unknownCommand) < leven(suggestion || '', unknownCommand)
    if (leven(cmd, unknownCommand) < 3 && isBestMatch) {
      suggestion = cmd
    }
  })

  if (suggestion) {
    console.log(`  ` + pico.red(`Did you mean ${pico.yellow(suggestion)}?`))
  }
}
