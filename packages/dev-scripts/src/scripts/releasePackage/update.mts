import { fs, pico } from '@mango-scripts/utils'

import { run, step, getSelfBinPath } from '../../utils/index.mjs'

import type { Pkg } from './type.mjs'

export const updateVersion = async (
  pkgPath: string,
  version: string,
): Promise<void> => {
  const pkg = await fs.readJSON(pkgPath)
  const privVersion = pkg.version
  pkg.version = version
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')

  console.log(pico.green('\n更新版本号：'))
  console.log(`${privVersion} -> ${version}`)
}

export const updateDepVersion = async (
  pkgPath: string,
  pkgList: Pkg[],
): Promise<void> => {
  const pkgJson = await fs.readJSON(pkgPath)
  const updatedDeps: { key: string; oldValue: string; newValue: string }[] = []

  // 更新指定依赖项版本号
  const _updateVersion = (dependencies: Record<string, string> | undefined) => {
    if (!dependencies) return
    for (const [key, value] of Object.entries(dependencies)) {
      // 检查依赖项是否使用 workspace:* 前缀
      if (value.startsWith('workspace:')) {
        const actualPkg = pkgList.find((pkg) => pkg.pkgName === key)
        if (actualPkg) {
          const oldValue = value
          // 根据 workspace 前缀类型，更新为对应的版本号格式
          if (value === 'workspace:*') {
            dependencies[key] = actualPkg.pkgCurrentVersion
          } else if (value.startsWith('workspace:~')) {
            dependencies[key] = `~${actualPkg.pkgCurrentVersion}`
          } else if (value.startsWith('workspace:^')) {
            dependencies[key] = `^${actualPkg.pkgCurrentVersion}`
          } else if (value.startsWith('workspace:')) {
            dependencies[key] = value.replace('workspace:', '') // 处理带版本号的 workspace 前缀
          }
          updatedDeps.push({ key, oldValue, newValue: dependencies[key] })
        }
      }
    }
  }

  // 更新 dependencies、devDependencies 和 peerDependencies
  _updateVersion(pkgJson.dependencies)
  _updateVersion(pkgJson.devDependencies)
  _updateVersion(pkgJson.peerDependencies)

  // 将更新后的内容写回 package.json 文件
  fs.writeFile(pkgPath, JSON.stringify(pkgJson, null, 2) + '\n')

  console.log(pico.green('\n更新依赖包版本号：'))
  // 在更新完成后输出日志
  updatedDeps.forEach(({ key, oldValue, newValue }) => {
    console.log(`${`[${key}:${oldValue}]`} -> ${`[${key}:${newValue}]`}`)
  })
  console.log()
}

export const updateChangelog = async (
  pkgDirPath: string,
  pkgName: string,
  isMonorepo: boolean = true,
): Promise<void> => {
  const changelogBin = getSelfBinPath('conventional-changelog')

  const args = [
    '-p',
    'conventionalcommits',
    '-i',
    'CHANGELOG.md',
    '-s',
    ...(isMonorepo ? ['--commit-path', '.', '--lerna-package', pkgName] : []),
  ]

  await run(changelogBin, args, { cwd: pkgDirPath })
}
