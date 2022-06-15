const fs = require('fs-extra')
const path = require('path')
const inquirer = require('inquirer')
const pico = require('picocolors')
const consola = require('consola')
const glob = require('glob-promise')

inquirer.registerPrompt('fuzzypath', require('inquirer-fuzzy-path'))

async function jsTojsx(options) {
  let { input, output } = options

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

    const answer = await inquirer.prompt(promps)
    input = answer.input
    output = answer.output
  }

  const cwd = options.cwd || process.cwd()
  const inputDirPath = path.resolve(cwd, input)
  const outputDirPath = path.resolve(cwd, output)

  console.log(
    pico.green(`
  待转换文件的目录路径: ${inputDirPath}
  转换后生成文件存储的目录路径: ${outputDirPath}
  `)
  )

  const filePathList = await glob(`${inputDirPath}/**/*`, { nodir: true })

  consola.success(`共读取到 ${filePathList.length} 个文件`)

  return Promise.all(
    filePathList.map((_filePath) => {
      const filePath = path.resolve(_filePath)
      const newFilePath = filePath.replace(inputDirPath, outputDirPath)
      if (path.extname(filePath) === '.js') {
        const renameNewFilePath = newFilePath.replace('.js', '.jsx')
        return fs.copy(filePath, renameNewFilePath)
      } else {
        return fs.copy(filePath, newFilePath)
      }
    })
  ).finally(() => {
    consola.success('转换完成！')
  })
}

module.exports = (...args) => {
  return jsTojsx(...args).catch((err) => {
    console.log(err)
  })
}
