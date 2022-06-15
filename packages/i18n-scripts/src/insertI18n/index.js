const fs = require('fs-extra')
const path = require('path')
const inquirer = require('inquirer')
const colors = require('picocolors')
const consola = require('consola')
const gogocode = require('gogocode')
const glob = require('glob-promise')

inquirer.registerPrompt('fuzzypath', require('inquirer-fuzzy-path'))
const INCLUDE_CHINESE_CHAR = /.*[\u4e00-\u9fff]+.*$/
const INCLUDE_VARIABLE_CHAR = /[{{}}]+/

const insertI18nForVueFile = (filePath) => {
  return gogocode
    .loadFile(filePath, {
      parseOptions: {
        language: 'vue'
      }
    })
    .find('<template></template>')
    .find(['<$_$></$_$>', '<$_$ />'])
    .each((node) => {
      //如果节点含有属性,则遍历它的属性
      if (Array.isArray(node.attr('content.children'))) {
        node.attr('content.children').forEach((text) => {
          const re = text?.content?.value?.content?.trim()
          if (
            re &&
            INCLUDE_CHINESE_CHAR.test(re) &&
            !INCLUDE_VARIABLE_CHAR.test(re)
          ) {
            text.content.value.content = `{{$t('${re}')}}`
          }
        })
      }

      if (Array.isArray(node.attr('content.attributes'))) {
        node.attr('content.attributes').forEach((attr) => {
          const keyIsDym =
            attr?.key?.content && attr.key.content.startsWith(':')
          const re = attr?.value?.content
          if (!keyIsDym && INCLUDE_CHINESE_CHAR.test(re)) {
            attr.key.content = `:${attr.key.content}`
            attr.value.content = `$t('${attr.value.content}')`
          }
        })
      }
    })
    .root()
    .find('<script></script>')
    .find({ type: 'StringLiteral' })
    .each((item) => {
      const re = item.attr('value')
      if (re && INCLUDE_CHINESE_CHAR.test(re)) {
        item.replaceBy(`this.$t('${re}')`)
      }
    })
    .root()
    .generate()
}

async function insertI18n(options) {
  let { input, output, translateModulesStr } = options

  if (!input || !output) {
    let promps = []
    if (!input) {
      promps.push({
        type: 'fuzzypath',
        name: 'input',
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
        message: '请选择待转换文件的目录路径',
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
        message: '请选择转换后生成文件存储的目录路径',
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

    if (!translateModulesStr) {
      promps.push({
        type: 'input',
        name: 'translateModulesStr',
        message: '请输入翻译模块字段',
        validate: function (input) {
          if (!input) {
            return '翻译模块字段不能为空!'
          }
          return true
        }
      })
    }

    const answer = await inquirer.prompt(promps)
    input = answer.input
    output = answer.output
    translateModulesStr = answer.translateModulesStr
  }

  const cwd = options.cwd || process.cwd()
  const inputDirPath = path.resolve(cwd, input)
  const outputDirPath = path.resolve(cwd, output)

  console.log(
    colors.green(`
  待转换文件的目录路径: ${inputDirPath}
  转换后生成文件存储的目录路径: ${outputDirPath}
  翻译模块字段: ${translateModulesStr}
  `)
  )

  const filePathList = await glob(`${inputDirPath}/**/*`, { nodir: true })

  consola.success(`共读取到 ${filePathList.length} 个文件`)

  return Promise.all(
    filePathList.map((_filePath) => {
      const filePath = path.resolve(_filePath)
      const newFilePath = filePath.replace(inputDirPath, outputDirPath)
      if (path.extname(filePath) === '.vue') {
        const newCode = insertI18nForVueFile(filePath)
        return fs.outputFile(newFilePath, translateModulesStr + newCode)
      } else {
        return fs.copy(filePath, newFilePath)
      }
    })
  ).finally(() => {
    consola.success('转换完成！')
  })
}

module.exports = (...args) => {
  return insertI18n(...args).catch((err) => {
    console.log(err)
  })
}
