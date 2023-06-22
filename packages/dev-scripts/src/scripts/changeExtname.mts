import path from 'node:path'
import fs from 'fs-extra'
import pico from 'picocolors'
import consola from 'consola'
import inquirer from 'inquirer'
import fuzzypath from 'inquirer-fuzzy-path'
import { glob } from 'glob'

inquirer.registerPrompt('fuzzypath', fuzzypath)

type ChangeExtnameOptionsType = {
  input: string
  output: string
  originExt: string
  targetExt: string
}

const changeExtname = async (
  options: ChangeExtnameOptionsType
): Promise<void> => {
  let { input, output, originExt, targetExt } = options

  if (!input || !output || !originExt || !targetExt) {
    const answer = await inquirer.prompt(
      [
        !input && {
          type: 'fuzzypath',
          name: 'input',
          excludePath: (nodePath: string) =>
            nodePath.startsWith('node_modules'),
          itemType: 'directory',
          rootPath: './',
          message: '请选择待转换文件的目录路径',
          suggestOnly: false,
          depthLimit: undefined
        },
        !output && {
          type: 'fuzzypath',
          name: 'output',
          excludePath: (nodePath: string) =>
            nodePath.startsWith('node_modules'),
          itemType: 'directory',
          rootPath: './',
          message: '请选择转换后生成文件的存储目录路径',
          suggestOnly: false,
          depthLimit: undefined
        },
        !originExt && {
          type: 'input',
          name: 'translateModulesStr',
          message: '请输入待转换文件的后缀名',
          validate: function (v: string) {
            if (!v) {
              return '后缀名不能为空!'
            }
            return true
          }
        },
        !targetExt && {
          type: 'input',
          name: 'translateModulesStr',
          message: '请输入转换后生成文件的后缀名',
          validate: function (v: string) {
            if (!v) {
              return '后缀名不能为空!'
            }
            return true
          }
        }
      ].filter(Boolean)
    )
    input = answer.input
    output = answer.output
    originExt = answer.originExt
    targetExt = answer.targetExt
  }

  const inputDirPath = path.resolve(process.cwd(), input)
  const outputDirPath = path.resolve(process.cwd(), output)

  consola.info(
    pico.green(`
  待转换文件的目录路径: ${inputDirPath}
  转换后生成文件的存储目录路径: ${outputDirPath}
  待转换文件的后缀名: ${originExt}
  转换后生成文件的后缀名: ${targetExt}
  `)
  )

  const filePathList = await glob(`${inputDirPath}/**/*`, { nodir: true })

  const originFilePathList: string[] = []
  const otherFilePathList: string[] = []

  filePathList.forEach((_path: string) => {
    const filePath = path.resolve(_path)
    if (path.extname(filePath) === originExt) {
      originFilePathList.push(filePath)
    } else {
      otherFilePathList.push(filePath)
    }
  })

  consola.success(pico.cyan(`读取到 ${originFilePathList.length} 个目标文件`))
  consola.success(`读取到 ${originFilePathList.length} 个其他类型文件`)

  consola.start('开始转换文件...')
  await Promise.all(
    originFilePathList.map((_filePath: string) => {
      const newFilePath = _filePath
        .replace(inputDirPath, outputDirPath)
        .replace(originExt, targetExt)
      return fs.copy(_filePath, newFilePath)
    })
  )

  consola.success(pico.cyan(`转换完成！`))

  consola.start('复制其他类型文件到存储目录...')
  await Promise.all(
    otherFilePathList.map((_filePath: string) => {
      const newFilePath = _filePath.replace(inputDirPath, outputDirPath)
      return fs.copy(_filePath, newFilePath)
    })
  )

  consola.success(pico.cyan(`复制完成！`))
}

export default changeExtname
