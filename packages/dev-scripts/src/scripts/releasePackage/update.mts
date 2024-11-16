import { fs, pico } from '@mango-scripts/utils'

import { run, step } from '../../utils/index.mjs'

import type { Pkg } from '../../utils/index.mjs'

export const updateVersion = async (
  pkgPath: string,
  version: string,
): Promise<void> => {
  const pkg = await fs.readJSON(pkgPath)
  pkg.version = version
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
}

export const updateDepVersion = async (
  pkgPath: string,
  pkgList: Pkg[],
): Promise<void> => {
  // 读取 package.json 文件内容
  const pkgJson = await fs.readJSON(pkgPath)

  // 更新指定依赖项版本号
  const _updateVersion = (dependencies: Record<string, string> | undefined) => {
    if (!dependencies) return
    for (const [key, value] of Object.entries(dependencies)) {
      // 检查依赖项是否使用 workspace:* 前缀
      if (value.startsWith('workspace:')) {
        const actualPkg = pkgList.find((pkg) => pkg.pkgName === key)
        if (actualPkg) {
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

          step(
            `更新依赖包${pico.bgWhite(`[${key}:${value}]`)}到${pico.bgWhite(`[${key}:${dependencies[key]}]`)}版本`,
          )
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
}

export const updateChangelog = async (
  pkgDirPath: string,
  pkgName: string,
): Promise<void> => {
  await run(
    'npx',
    [
      'conventional-changelog',
      '-p',
      'conventionalcommits',
      '-i',
      'CHANGELOG.md',
      '-s',
      '--commit-path',
      '.',
      '--lerna-package',
      pkgName,
    ],
    { cwd: pkgDirPath },
  )
}
