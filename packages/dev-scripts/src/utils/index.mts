import path from 'node:path'
import { fileURLToPath } from 'url'

import { execa, pico, consola, fs } from '@mango-scripts/utils'
import which from 'which'

import type { Pkg } from '../scripts/releasePackage/type.mjs'

export const run = async (
  bin: string,
  args: string[],
  opts: any = {},
): Promise<any> => {
  return execa(bin, args, { stdio: 'inherit', ...opts })
}

export const step = (msg: string) => consola.info(pico.cyan(msg))

export const getPolyrepoPkgInfo = async (): Promise<{
  pkgDir: string
  pkgDirPath: string
  pkgJsonFilePath: string
  pkgName: string
  pkgCurrentVersion: string
}> => {
  const pkgDirPath = path.resolve(process.cwd())
  const pkgDir = path.basename(pkgDirPath)
  const pkgJsonFilePath = path.join(pkgDirPath, 'package.json')

  if (!(await fs.pathExists(pkgJsonFilePath))) {
    consola.error(
      '无法找到包的 package.json 文件，请检查发布脚本是否位于仓库根目录下',
    )
    throw new Error()
  }

  const { name: pkgName, version: pkgCurrentVersion } =
    await fs.readJSON(pkgJsonFilePath)

  return {
    pkgDir,
    pkgDirPath,
    pkgJsonFilePath,
    pkgName,
    pkgCurrentVersion,
  }
}

export const renderDepTree = (deps: Pkg[], level = 0): string => {
  if (!deps?.length) return ''

  return deps
    .map((pkg) => {
      const isChanged = pkg.commitList && pkg.commitList?.length > 0
      const prefix = ' '.repeat(level * 2) + (level > 0 ? '─ ' : '')
      const label =
        pico.white(prefix + pkg.pkgName) +
        (isChanged ? pico.red(' [有代码变动]') : '')
      const children = pkg.deps?.length
        ? '\n' + renderDepTree(pkg.deps, level + 1)
        : ''
      return label + children
    })
    .join('\n')
}

export const getDepsChange = (deps: Pkg[]): boolean => {
  return (
    deps?.some((pkg) => {
      // 检查当前包是否有变动
      const currentPkgChanged = pkg.commitList && pkg.commitList?.length > 0
      // 递归检查子依赖是否有变动
      const depsChanged = pkg.deps ? getDepsChange(pkg.deps) : false
      // 如果当前包或任何子依赖有变动，则返回 true
      return currentPkgChanged || depsChanged
    }) ?? false
  )
}

export const getSelfBinPath = (binName: string): string => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))

  const binPath = path.join(__dirname, '../../../node_modules/.bin', binName)

  return binPath
}
