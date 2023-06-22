import path from 'node:path'
import { execa } from 'execa'
import fs from 'fs-extra'

import type { Options as ExecaOptions, ExecaReturnValue } from 'execa'

export interface IPkgInfo {
  pkgDir: string
  pkgDirPath: string
  pkgJsonFilePath: string
  pkgName: string
  pkgCurrentVersion: string
}

export async function getPkgInfoList(
  targetDirList: string[]
): Promise<IPkgInfo[]> {
  const pkgInfoList: IPkgInfo[] = []

  for (let i = 0; i < targetDirList.length; i++) {
    const targetDir = targetDirList[i]
    const targetDirPath = path.resolve(process.cwd(), targetDir)
    const _pkgDirList = await fs.readdir(targetDirPath)
    const pkgDirList = _pkgDirList.filter((filename) => filename[0] !== '.')

    for (let j = 0; j < pkgDirList.length; j++) {
      const pkgDir = pkgDirList[j]
      const pkgDirPath = path.join(targetDirPath, pkgDir)
      const pkgJsonFilePath = path.join(pkgDirPath, 'package.json')
      const isPkgJsonFilePathExist = await fs.pathExists(pkgJsonFilePath)
      if (isPkgJsonFilePathExist) {
        const packageJson = await fs.readJSON(pkgJsonFilePath)
        pkgInfoList.push({
          pkgDir,
          pkgDirPath,
          pkgJsonFilePath,
          pkgName: packageJson?.name,
          pkgCurrentVersion: packageJson?.version
        })
      }
    }
  }

  return pkgInfoList
}

export async function run(
  bin: string,
  args: string[],
  opts: ExecaOptions<string> = {}
): Promise<ExecaReturnValue<string>> {
  return execa(bin, args, { stdio: 'inherit', ...opts })
}
