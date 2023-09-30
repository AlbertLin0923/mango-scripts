import path from 'node:path'
import fs from 'fs-extra'
import pico from 'picocolors'
import consola from 'consola'
import inquirer from 'inquirer'
import fuzzypath from 'inquirer-fuzzy-path'
import gogocode from 'gogocode'
import { glob } from 'glob'

inquirer.registerPrompt('fuzzypath', fuzzypath)

const INCLUDE_CHINESE_CHAR = /.*[\u4e00-\u9fff]+.*$/
const INCLUDE_VARIABLE_CHAR = /[{{}}]+/

const insertI18nForVueFile = (filePath: string) => {
  return gogocode
    .loadFile(filePath, {
      parseOptions: {
        language: 'vue'
      }
    })
    .find('<template></template>')
    .find(['<$_$></$_$>', '<$_$ />'])
    .each((node) => {
      if (Array.isArray(node.attr('content.children'))) {
        ;(node.attr('content.children') as []).forEach((text: any) => {
          const re = text?.content?.value?.content?.trim()
          if (re && INCLUDE_CHINESE_CHAR.test(re) && !INCLUDE_VARIABLE_CHAR.test(re)) {
            text.content.value.content = `{{$t('${re}')}}`
          }
        })
      }

      if (Array.isArray(node.attr('content.attributes'))) {
        ;(node.attr('content.attributes') as []).forEach((attr: any) => {
          const keyIsDym = attr?.key?.content && attr.key.content.startsWith(':')
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
      if (re && INCLUDE_CHINESE_CHAR.test(re as string)) {
        item.replaceBy(`this.$t('${re}')`)
      }
    })
    .root()
    .generate()
}

type InsertI18nOptionsType = {
  input: string
  output: string
  localeModulesStr: string
}

const insertI18n = async (options: InsertI18nOptionsType): Promise<void> => {
  let { input, output, localeModulesStr } = options

  if (!input || !output || !localeModulesStr) {
    const answer = await inquirer.prompt(
      [
        !input && {
          type: 'fuzzypath',
          name: 'input',
          excludePath: (nodePath: string) => nodePath.startsWith('node_modules'),
          itemType: 'directory',
          rootPath: './',
          message: '请选择输入目录路径',
          suggestOnly: false,
          depthLimit: undefined
        },
        !output && {
          type: 'fuzzypath',
          name: 'output',
          excludePath: (nodePath: string) => nodePath.startsWith('node_modules'),
          itemType: 'directory',
          rootPath: './',
          message: '请选择输出目录路径',
          suggestOnly: false,
          depthLimit: undefined
        },
        !localeModulesStr && {
          type: 'input',
          name: 'localeModulesStr',
          message: '请输入国际化文案模块字段',
          validate: function (v: string) {
            if (!v) {
              return '国际化文案模块字段不能为空!'
            }
            return true
          }
        }
      ].filter(Boolean)
    )
    input = answer.input
    output = answer.output
    localeModulesStr = answer.localeModulesStr
  }

  const inputDirPath = path.resolve(process.cwd(), input)
  const outputDirPath = path.resolve(process.cwd(), output)

  console.log(
    `
输入目录路径: ${pico.green(inputDirPath)}
输出目录路径: ${pico.green(outputDirPath)}
国际化文案模块字段: ${pico.green(localeModulesStr)}
  `
  )

  const filePathList = await glob(`${inputDirPath}/**/*`, { nodir: true })

  const originFilePathList: string[] = []
  const otherFilePathList: string[] = []

  filePathList.forEach((_path: string) => {
    const filePath = path.resolve(_path)
    if (path.extname(filePath) === '.vue') {
      originFilePathList.push(filePath)
    } else {
      otherFilePathList.push(filePath)
    }
  })

  consola.success(
    pico.cyan(
      `读取到 ${originFilePathList.length} 个文件待转换； ${originFilePathList.length} 个其他类型文件无需转换`
    )
  )

  const { yes } = await inquirer.prompt({
    type: 'confirm',
    name: 'yes',
    message: '确定开始转换文件吗？',
    default: true
  })

  if (!yes) {
    return
  }

  consola.start('开始转换文件...')
  await Promise.all(
    originFilePathList.map((_filePath: string) => {
      const newFilePath = _filePath.replace(inputDirPath, outputDirPath)
      const newCode = insertI18nForVueFile(_filePath)
      return fs.outputFile(newFilePath, localeModulesStr + newCode)
    })
  )

  consola.success(`转换完成！`)

  consola.start('复制其他类型文件到存储目录...')
  await Promise.all(
    otherFilePathList.map((_filePath: string) => {
      const newFilePath = _filePath.replace(inputDirPath, outputDirPath)
      return fs.copy(_filePath, newFilePath)
    })
  )

  consola.success(`复制完成！`)
}

export default insertI18n
