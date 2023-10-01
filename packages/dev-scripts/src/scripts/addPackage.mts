import pico from 'picocolors'
import consola from 'consola'
import npmKeyword from 'npm-keyword'
import packageJson from 'package-json'
import { run, getPkgInfoList } from '../utils/index.mjs'
import inquirer from 'inquirer'
import inquirerPrompt from 'inquirer-autocomplete-prompt'

inquirer.registerPrompt('autocomplete', inquirerPrompt)

const typeMap = [
  { name: 'dependencies', value: '--save-prod' },
  { name: 'devDependencies', value: '--save-dev' },
]

type AddPackageOptionsType = {
  targetDirList: string[]
}

const addPackage = async (options: AddPackageOptionsType): Promise<void> => {
  const { targetDirList } = options
  const appList = await getPkgInfoList(targetDirList)

  const { appName, installPkgName, type } = await inquirer.prompt([
    {
      type: 'list',
      name: 'appName',
      message: '哪个项目需要安装依赖包？',
      choices: appList.map((i) => ({ value: i.pkgName, name: i.pkgName })),
    },
    {
      type: 'autocomplete',
      name: 'installPkgName',
      message: '输入需要安装的依赖包名称',
      source: async (
        answersSoFar: any,
        input: string,
      ): Promise<{ value: string; name: string }[]> => {
        if (!input || !input.trim()) {
          return []
        }
        const response = await npmKeyword(input.trim())
        return response.map((i: any) => ({ value: i.name, name: i.name }))
      },
      suggestOnly: true,
      searchText: '正在从npm上查找该包...',
      emptyText: '暂无数据',
    },
    {
      type: 'list',
      name: 'type',
      message: `依赖包安装到哪里？ ${pico.red(
        '[注意: typescript类型包请安装到devDependencies]',
      )}`,
      choices: typeMap.map((i) => ({ name: i.name, value: i.name })),
    },
  ])

  const pkgJson = await packageJson(installPkgName, { fullMetadata: true })

  const isTypeScriptPkg = Boolean(pkgJson.types || pkgJson.typings)

  if (!isTypeScriptPkg) {
    consola.start(
      pico.yellow(
        `当前下载的包 ${pico.cyan(
          installPkgName,
        )} 没有内置TypeScript类型文件，正在搜寻类型定义文件 ${`@types/${installPkgName.trim()}`}`,
      ),
    )
  }

  const response = await packageJson(`@types/${installPkgName.trim()}`)

  console.log(response)

  if (response) {
    consola.info(response)
  }

  const { yes } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'yes',
      message: `确定安装 ${pico.yellow(installPkgName)} 到 ${pico.magenta(
        appName,
      )} ${pico.cyan(type)}?`,
    },
  ])

  const typeValue = typeMap.find((i) => i.name === type)?.value

  if (yes) {
    console.log(
      `执行 ${pico.cyan(
        `pnpm add ${installPkgName} ${typeValue} --filter ${appName}`,
      )}`,
    )
    await run('pnpm', [
      'add',
      `${installPkgName}`,
      `${typeValue}`,
      '--filter',
      `${appName}`,
    ])
  } else {
    console.log(pico.red('取消安装'))
  }

  console.log()
}

export default addPackage
