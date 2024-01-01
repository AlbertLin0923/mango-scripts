import path from 'node:path'

import {
  fs,
  pico,
  consola,
  inquirer,
  request,
  CliTable,
} from '@mango-scripts/utils'

import { compareLocaleData, cusJsonStringify } from '../utils/index.mjs'
import defaultLocaleList from '../utils/defaultLocaleList.mjs'

type StatType = Record<
  string,
  {
    addNumber: number
    modifyNumber: number
    deleteNumber: number
    sameNumber: number
  }
>

type UpdateLocaleOptions = {
  address: string
  output: string
  localeList: string[]
}

type FromAddressMapType = Record<string, Record<string, any>>

const updateLocale = async (options: UpdateLocaleOptions): Promise<void> => {
  let { address, output, localeList } = options

  if (!address || !output || !localeList) {
    const answer = await inquirer.prompt(
      [
        !address && {
          type: 'input',
          name: 'address',
          message: '请输入国际化文案配置系统接口地址',
          validate: (input: string) => {
            if (!input) {
              return '国际化文案配置系统接口地址不能为空!'
            }
            return true
          },
        },
        !output && {
          type: 'fuzzypath',
          name: 'output',
          excludePath: (nodePath: string) =>
            nodePath.startsWith('node_modules'),
          itemType: 'directory',
          rootPath: './',
          message: '请选择语言包的存放目录路径',
          suggestOnly: false,
          depthLimit: undefined,
        },
        !localeList && {
          type: 'checkbox',
          message: '请选择需要下载的语言包列表',
          name: 'localeList',
          choices: defaultLocaleList.map((i) => {
            return {
              name: i.fileName,
            }
          }),
          validate: (v: string[]) => {
            if (v.length < 1) {
              return '至少选择一个语言包列表'
            }
            return true
          },
        },
      ].filter(Boolean),
    )

    address = answer.ddress
    output = answer.output
    localeList = answer.localeList
  }

  const newLocaleDirPath = path.resolve(process.cwd(), output)

  console.log(
    `
国际化文案配置系统接口地址: ${pico.green(address)}
语言包的存放目录路径: ${pico.green(newLocaleDirPath)}
需要下载的语言包列表: ${pico.green(localeList.join(' '))}
  `,
  )

  const oldlocaleBackupDirPath = path.resolve(
    newLocaleDirPath,
    '../',
    'this-is-old-locale-backup-folder',
  )

  consola.start('开始请求系统数据...')

  const newlocaleArr: { key: string; value: Record<string, any> }[] = []

  const { body } = await request(address, {
    method: 'GET',
  })

  const {
    success,
    data: { map },
  }: { success: boolean; data: { map: FromAddressMapType } } =
    (await body.json()) as any

  if (success && map) {
    Object.entries(map).forEach(([key, value]) => {
      if (localeList.includes(key)) {
        newlocaleArr.push({ key: key, value: value })
      }
    })
  } else {
    throw new Error('请求系统数据失败,请重试或联系管理员')
  }

  consola.success('数据请求成功！')

  consola.start('开始备份旧语言包文件...')

  await fs.emptyDir(oldlocaleBackupDirPath)

  await fs.copy(newLocaleDirPath, oldlocaleBackupDirPath)

  consola.success('备份旧语言包文件成功！')

  consola.start('开始清空语言包目录...')

  await fs.emptyDir(newLocaleDirPath)

  consola.success('清空语言包目录成功！')

  consola.start('写入新的语言包文件...')

  const stat: StatType = {}

  for (let index = 0; index < newlocaleArr.length; index++) {
    const element = newlocaleArr[index]
    await fs.writeFile(
      path.join(newLocaleDirPath, element.key + '.json'),
      cusJsonStringify(element.value),
    )

    stat[element.key] = await compareLocaleData(
      path.join(oldlocaleBackupDirPath, element.key + '.json'),
      path.join(newLocaleDirPath, element.key + '.json'),
    )
  }

  consola.success('写入新的语言包文件成功！')

  consola.start('开始删除备份目录...')

  await fs.remove(oldlocaleBackupDirPath)

  consola.success('清空备份目录成功')

  const iTable = new CliTable({
    head: [
      pico.bold(pico.cyan('locale')),
      pico.bold(pico.cyan('add')),
      pico.bold(pico.cyan('modify')),
      pico.bold(pico.cyan('delete')),
      pico.bold(pico.cyan('same')),
    ],
  })

  Object.entries(stat).forEach(([key, value]) => {
    iTable.push([
      pico.yellow(key),
      pico.yellow(value.addNumber),
      pico.yellow(value.modifyNumber),
      pico.yellow(value.deleteNumber),
      pico.yellow(value.sameNumber),
    ])
  })

  console.log(iTable.toString())

  process.exit(0)
}

export default updateLocale
