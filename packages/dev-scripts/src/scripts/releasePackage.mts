// Forked from https://github.com/vitejs/vite/blob/main/scripts

import path from 'node:path'

import {
  pico,
  minimist,
  consola,
  semver,
  prompts,
  getGitRepoInfo,
} from '@mango-scripts/utils'

import {
  getPkgInfoList,
  getVersionChoices,
  logCommitsForPackage,
  run,
  step,
  updateVersion,
  publishPkg,
  isWorktreeEmpty,
  confirmRegistry,
} from '../utils/releaseUtils.mjs'

export const release = async (): Promise<void> => {
  const { branch } = getGitRepoInfo()
  consola.info(pico.cyan(`当前分支: ${branch}`))

  // if (!(await isWorktreeEmpty())) {
  //   consola.error('当前工作区有尚未提交的代码，请先提交代码')
  //   return
  // }

  // if (!(await confirmRegistry())) {
  //   return
  // }

  const pkgList = await getPkgInfoList()

  console.log('pkgList', pkgList)

  const pkgListWithCommitList = (
    await Promise.all(
      pkgList.map(async (pkg) => {
        const { pkgName } = pkg
        const commitList = await logCommitsForPackage(pkgName)

        console.log('commitList', pkgName, commitList)
        return { ...pkg, commitList }
      }),
    )
  ).filter((pkg) => {
    return pkg.commitList.length > 0
  })

  const { selectedPkg } = await prompts({
    type: 'select',
    name: 'selectedPkg',
    message: '选择待发布的包',
    choices: pkgListWithCommitList.map((pkg) => ({
      value: pkg,
      title: `${pkg.pkgName}[${pkg.commitList.length}]`,
    })),
  })

  //   if (!pkg) return

  //   const { pkgName, pkgJsonFilePath, pkgDirPath, pkgCurrentVersion } = pkg

  //   await logRecentCommits(pkgName)

  //   if (!targetVersion) {
  //     const { releaseType }: { releaseType: string } = await prompts({
  //       type: 'select',
  //       name: 'releaseType',
  //       message: 'Select release type',
  //       choices: getVersionChoices(pkgCurrentVersion),
  //     })

  //     if (releaseType === 'custom') {
  //       const res: { version: string } = await prompts({
  //         type: 'text',
  //         name: 'version',
  //         message: 'Input custom version',
  //         initial: pkgCurrentVersion,
  //       })
  //       targetVersion = res.version
  //     } else {
  //       targetVersion = releaseType
  //     }
  //   }

  //   if (!semver.valid(targetVersion)) {
  //     throw new Error(`invalid target version: ${targetVersion}`)
  //   }

  //   const tag = `${pkgName}@${targetVersion}`

  //   const { yes }: { yes: boolean } = await prompts({
  //     type: 'confirm',
  //     name: 'yes',
  //     message: `Releasing ${pico.yellow(tag)} Confirm?`,
  //   })

  //   if (!yes) {
  //     return
  //   }

  //   step('\nUpdating package version...')

  //   await updateVersion(pkgJsonFilePath, targetVersion)

  //   step('\nGenerating changelog...')

  //   const changelogArgs = [
  //     'conventional-changelog',
  //     '-p',
  //     'conventionalcommits',
  //     '-i',
  //     'CHANGELOG.md',
  //     '-s',
  //     '--commit-path',
  //     '.',
  //   ]
  //   changelogArgs.push('--lerna-package', pkgName)

  //   await run('npx', changelogArgs, { cwd: pkgDirPath })

  //   const { stdout } = await run('git', ['diff'], { stdio: 'pipe' })
  //   if (stdout) {
  //     step('\nCommitting changes...')
  //     await run('git', ['add', '-A'])
  //     await run('git', ['commit', '-m', `feat: release ${tag}`])
  //     await run('git', ['tag', tag])
  //   } else {
  //     consola.info('No changes to commit.')
  //     return
  //   }

  //   step('\nPushing to GitHub...')
  //   await run('git', ['push', 'origin', `refs/tags/${tag}`])
  //   await run('git', ['push'])

  //   consola.success(
  //     pico.green(
  //       `
  // Pushed, publishing should starts shortly on CI.
  // `,
  //     ),
  //   )
}

export const publish = async (tag: string) => {
  if (!tag) throw new Error('No tag specified')

  const versionSeg = tag.lastIndexOf('@')

  if (versionSeg === -1) {
    throw new Error('Tag format error')
  }

  const pkgName = tag.slice(0, versionSeg)

  const version = tag.slice(versionSeg + 1)

  const rawPkgName = pkgName.split('/')[1]

  step(`Publishing ${pkgName} package...`)

  await publishPkg(
    path.join(process.cwd(), `./packages/${rawPkgName}`),
    version.includes('beta')
      ? 'beta'
      : version.includes('alpha')
        ? 'alpha'
        : undefined,
  )
}

const releasePackage = async () => {
  const { tag } = minimist(process.argv.slice(2))
  tag ? publish(tag) : release()
}

export default releasePackage
