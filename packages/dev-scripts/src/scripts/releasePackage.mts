// Forked from https://github.com/vitejs/vite/blob/main/scripts

import path from 'node:path'

import minimist from 'minimist'
import prompts from 'prompts'
import semver from 'semver'
import pico from 'picocolors'
import getGitRepoInfo from 'git-repo-info'

import {
  getPkgInfoList,
  getVersionChoices,
  logRecentCommits,
  run,
  step,
  updateVersion,
  publishPkg,
} from '../utils/index.mjs'

import type { IPkgInfo } from '../utils/index.mjs'

export const boot = async (): Promise<void> => {
  const { branch } = getGitRepoInfo()
  console.log(pico.cyan(`now in branch: ${branch}\n`))

  let targetVersion: string | undefined

  const pkgList = await getPkgInfoList(['./packages'])

  const { pkg }: { pkg: IPkgInfo } = await prompts({
    type: 'select',
    name: 'pkg',
    message: 'Select package',
    choices: pkgList.map((i) => ({ value: i, title: i.pkgName })),
  })

  if (!pkg) return

  const { pkgName, pkgJsonFilePath, pkgDirPath, pkgCurrentVersion } = pkg

  await logRecentCommits(pkgName)

  if (!targetVersion) {
    const { releaseType }: { releaseType: string } = await prompts({
      type: 'select',
      name: 'releaseType',
      message: 'Select release type',
      choices: getVersionChoices(pkgCurrentVersion),
    })

    if (releaseType === 'custom') {
      const res: { version: string } = await prompts({
        type: 'text',
        name: 'version',
        message: 'Input custom version',
        initial: pkgCurrentVersion,
      })
      targetVersion = res.version
    } else {
      targetVersion = releaseType
    }
  }

  if (!semver.valid(targetVersion)) {
    throw new Error(`invalid target version: ${targetVersion}`)
  }

  const tag = `${pkgName}@${targetVersion}`

  const { yes }: { yes: boolean } = await prompts({
    type: 'confirm',
    name: 'yes',
    message: `Releasing ${pico.yellow(tag)} Confirm?`,
  })

  if (!yes) {
    return
  }

  step('\nUpdating package version...')

  await updateVersion(pkgJsonFilePath, targetVersion)

  step('\nGenerating changelog...')

  const changelogArgs = [
    'conventional-changelog',
    '-p',
    'conventionalcommits',
    '-i',
    'CHANGELOG.md',
    '-s',
    '--commit-path',
    '.',
  ]
  changelogArgs.push('--lerna-package', pkgName)

  await run('npx', changelogArgs, { cwd: pkgDirPath })

  const { stdout } = await run('git', ['diff'], { stdio: 'pipe' })
  if (stdout) {
    step('\nCommitting changes...')
    await run('git', ['add', '-A'])
    await run('git', ['commit', '-m', `feat: release ${tag}`])
    await run('git', ['tag', tag])
  } else {
    console.log('No changes to commit.')
    return
  }

  step('\nPushing to GitHub...')
  await run('git', ['push', 'origin', `refs/tags/${tag}`])
  await run('git', ['push'])

  console.log(
    pico.green(
      `
Pushed, publishing should starts shortly on CI.
`,
    ),
  )

  console.log()
}

export const publishCI = async (tag: string) => {
  if (!tag) {
    throw new Error('No tag specified')
  }

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
  const processArgs = minimist(process.argv.slice(2))
  const { tag } = processArgs
  if (tag) {
    publishCI(tag)
  } else {
    boot()
  }
}

export default releasePackage
