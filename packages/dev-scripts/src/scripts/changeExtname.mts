import path from 'node:path'

import { fs, pico, consola, inquirer, glob } from '@mango-scripts/utils'

type ChangeExtnameOptionsType = {
  input: string
  output: string
  originExt: string
  targetExt: string
}

const changeExtname = async (
  options: ChangeExtnameOptionsType,
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
          message: '请选择输入目录路径',
          suggestOnly: false,
          depthLimit: undefined,
        },
        !output && {
          type: 'fuzzypath',
          name: 'output',
          excludePath: (nodePath: string) =>
            nodePath.startsWith('node_modules'),
          itemType: 'directory',
          rootPath: './',
          message: '请选择输出目录路径',
          suggestOnly: false,
          depthLimit: undefined,
        },
        !originExt && {
          type: 'input',
          name: 'translateModulesStr',
          message: '请输入原始后缀名',
          validate: function (v: string) {
            if (!v) {
              return '后缀名不能为空!'
            }
            return true
          },
        },
        !targetExt && {
          type: 'input',
          name: 'translateModulesStr',
          message: '请输入目标后缀名',
          validate: function (v: string) {
            if (!v) {
              return '后缀名不能为空!'
            }
            return true
          },
        },
      ].filter(Boolean),
    )
    input = answer.input
    output = answer.output
    originExt = answer.originExt
    targetExt = answer.targetExt
  }

  const inputDirPath = path.resolve(process.cwd(), input)
  const outputDirPath = path.resolve(process.cwd(), output)

  consola.info(
    `
输入目录路径: ${pico.green(inputDirPath)}
输出目录路径: ${pico.green(outputDirPath)}
原始后缀名: ${pico.green(originExt)}
目标后缀名: ${pico.green(targetExt)}
  `,
  )

  consola.start('开始读取文件...')

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

  consola.success(
    pico.cyan(
      `读取到 ${originFilePathList.length} 个文件待转换； ${originFilePathList.length} 个其他类型文件无需转换`,
    ),
  )

  consola.start('开始转换文件...')
  await Promise.all(
    originFilePathList.map((_filePath: string) => {
      const newFilePath = _filePath
        .replace(inputDirPath, outputDirPath)
        .replace(originExt, targetExt)
      return fs.copy(_filePath, newFilePath)
    }),
  )

  consola.success(pico.cyan(`转换完成！`))

  consola.start('复制其他类型文件到存储目录...')
  await Promise.all(
    otherFilePathList.map((_filePath: string) => {
      const newFilePath = _filePath.replace(inputDirPath, outputDirPath)
      return fs.copy(_filePath, newFilePath)
    }),
  )

  consola.success(pico.cyan(`复制完成！`))
}

export default changeExtname
