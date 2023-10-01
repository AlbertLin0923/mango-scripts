import path from 'node:path'
import fs from 'fs-extra'
import pico from 'picocolors'
import consola from 'consola'
import getGitRepoInfo from 'git-repo-info'
import { getPkgInfoList } from '../utils/index.mjs'

type CopyDistOptionsType = {
  targetDirList: string[]
}

const copyDist = async (options: CopyDistOptionsType): Promise<void> => {
  const { targetDirList } = options
  const appList = await getPkgInfoList(targetDirList)
  const rootDistPath = path.resolve(process.cwd(), './dist')

  const { branch } = getGitRepoInfo()

  consola.info(pico.cyan(`now in branch: ${branch} \n`))

  consola.start(`${pico.magenta('clean root dist dir')} ...`)

  await fs.emptyDir(rootDistPath)

  for (let i = 0; i < appList.length; i++) {
    const it = appList[i]

    const distPath = path.resolve(process.cwd(), it.pkgDirPath, './dist')

    consola.start(
      `copy ${pico.green(distPath)} to  ${pico.magenta('root dist dir')} ...`,
    )

    await fs.copy(distPath, path.resolve(rootDistPath, `./${it.pkgDir}`))
  }

  consola.success(
    `${pico.cyan('copy successfully!')} copy ${pico.yellow(
      appList.length,
    )} projects to ${pico.magenta('dist')}`,
  )
}

export default copyDist
