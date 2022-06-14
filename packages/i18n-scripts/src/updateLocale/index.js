const fs = require('fs-extra')
const path = require('path')
const inquirer = require('inquirer')
const request = require('umi-request')
const chalk = require('chalk')
const consola = require('consola')
const Table = require('cli-table')

const { compareLocaleData, cusJsonStringify } = require('../utils/index')
const allLocaleList = require('./allLocaleList')

inquirer.registerPrompt('fuzzypath', require('inquirer-fuzzy-path'))
const service = request.extend({
  timeout: 10000
})

async function updateLocale(options) {
  let { fromAddress, output, localeList } = options

  if (!fromAddress || !output || !localeList) {
    let promps = []
    if (!fromAddress) {
      promps.push({
        type: 'input',
        name: 'fromAddress',
        message: '请输入国际化文案配置系统接口地址',
        validate: function (input) {
          if (!input) {
            return '国际化文案配置系统接口地址不能为空!'
          }
          return true
        }
      })
    }

    if (!output) {
      promps.push({
        type: 'fuzzypath',
        name: 'output',
        excludePath: (nodePath) => nodePath.startsWith('node_modules'),
        // excludePath :: (String) -> Bool
        // excludePath to exclude some paths from the file-system scan
        itemType: 'directory',
        // itemType :: 'any' | 'directory' | 'file'
        // specify the type of nodes to display
        // default value: 'any'
        // example: itemType: 'file' - hides directories from the item list
        rootPath: './',
        // rootPath :: String
        // Root search directory
        message: '请选择语言包存放目录路径',
        // default: "",
        suggestOnly: false,
        // suggestOnly :: Bool
        // Restrict prompt answer to available choices or use them as suggestions
        depthLimit: undefined
        // depthLimit :: integer >= 0
        // Limit the depth of sub-folders to scan
        // Defaults to infinite depth if undefined
      })
    }

    if (!localeList) {
      promps.push({
        type: 'checkbox',
        message: '请选择需要下载的语言包列表',
        name: 'localeList',
        choices: allLocaleList.map((i) => {
          return {
            name: i.fileName
          }
        }),
        validate(answer) {
          if (answer.length < 1) {
            return '至少选择一个语言包列表'
          }
          return true
        }
      })
    }

    const answer = await inquirer.prompt(promps)
    fromAddress = answer.fromAddress
    output = answer.output
    localeList = answer.localeList
  }

  const cwd = options.cwd || process.cwd()
  const newLocaleDirPath = path.resolve(cwd, output)
  const oldlocaleBackupDirPath = path.resolve(
    newLocaleDirPath,
    '../',
    'this-is-old-locale-backup-folder'
  )

  consola.success('开始请求国际化文案配置系统数据...')

  const newlocaleArr = []
  const { success, data } = await service.get(fromAddress)
  if (success && data && data.map) {
    Object.entries(data.map).forEach(([key, value]) => {
      if (localeList.includes(key)) {
        newlocaleArr.push({ key: key, value: value })
      }
    })
  } else {
    throw new Error('请求国际化文案配置系统数据失败,请重试或联系管理员')
  }

  consola.success('数据请求成功,开始备份旧语言包文件...')

  await fs.copy(newLocaleDirPath, oldlocaleBackupDirPath)

  consola.success('备份旧语言包文件成功，开始清空语言包目录...')

  await fs.emptyDir(newLocaleDirPath)

  consola.success('清空语言包目录成功,写入新的语言包文件...')

  let stat = {}

  for (let index = 0; index < newlocaleArr.length; index++) {
    const element = newlocaleArr[index]
    await fs.writeFile(
      path.join(newLocaleDirPath, element.key + '.json'),
      cusJsonStringify(element.value)
    )

    stat[element.key] = await compareLocaleData(
      path.join(oldlocaleBackupDirPath, element.key + '.json'),
      path.join(newLocaleDirPath, element.key + '.json')
    )
  }

  consola.success('写入新的语言包文件成功,开始删除备份目录...')

  await fs.remove(oldlocaleBackupDirPath)

  consola.success('清空备份目录成功')

  const iTable = new Table({
    head: [
      chalk.bold.cyan('locale'),
      chalk.bold.cyan('add'),
      chalk.bold.cyan('modify'),
      chalk.bold.cyan('delete'),
      chalk.bold.cyan('same')
    ]
  })

  Object.entries(stat).forEach(([key, value]) => {
    iTable.push([
      chalk.yellow(key),
      chalk.yellow(value.addNumber),
      chalk.yellow(value.modifyNumber),
      chalk.yellow(value.deleteNumber),
      chalk.yellow(value.sameNumber)
    ])
  })

  console.log(iTable.toString())

  process.exit(0)
}

module.exports = (...args) => {
  return updateLocale(...args).catch((err) => {
    console.log(err)
  })
}
