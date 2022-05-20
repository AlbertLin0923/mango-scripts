import path from 'path'
import prompts from 'prompts'
import semver from 'semver'
import colors from 'picocolors'

import {
  IPkgInfo,
  getPkgInfoList,
  args,
  getVersionChoices,
  logRecentCommits,
  run,
  runIfNotDry,
  isDryRun,
  step,
  updateVersion
} from './releaseUtils'

async function bootstrap(): Promise<void> {
  let targetVersion: string | undefined

  const pkgInfoList: IPkgInfo[] = await getPkgInfoList(
    path.resolve(process.cwd(), './packages')
  )

  const { pkg }: { pkg: IPkgInfo } = await prompts({
    type: 'select',
    name: 'pkg',
    message: 'Select package',
    choices: pkgInfoList.map((i) => ({ value: i, title: i.pkgName }))
  })

  if (!pkg) return

  await logRecentCommits(pkg.pkgName)

  const { pkgName, pkgPath, pkgDirPath, pkgCurrentVersion } = pkg

  if (!targetVersion) {
    const { release }: { release: string } = await prompts({
      type: 'select',
      name: 'release',
      message: 'Select release type',
      choices: getVersionChoices(pkgCurrentVersion)
    })

    if (release === 'custom') {
      const res: { version: string } = await prompts({
        type: 'text',
        name: 'version',
        message: 'Input custom version',
        initial: pkgCurrentVersion
      })
      targetVersion = res.version
    } else {
      targetVersion = release
    }
  }

  if (!semver.valid(targetVersion)) {
    throw new Error(`invalid target version: ${targetVersion}`)
  }

  const tag = `${pkgName}@${targetVersion}`

  if (targetVersion.includes('beta') && !args.tag) {
    args.tag = 'beta'
  }
  if (targetVersion.includes('alpha') && !args.tag) {
    args.tag = 'alpha'
  }

  const { yes }: { yes: boolean } = await prompts({
    type: 'confirm',
    name: 'yes',
    message: `Releasing ${colors.yellow(tag)} Confirm?`
  })

  if (!yes) {
    return
  }

  step('\nUpdating package version...')

  await updateVersion(pkgPath, targetVersion)

  step('\nGenerating changelog...')

  const changelogArgs = [
    'conventional-changelog',
    '-p',
    'conventionalcommits',
    '-i',
    'CHANGELOG.md',
    '-s',
    '--commit-path',
    '.'
  ]
  changelogArgs.push('--lerna-package', pkgName)

  await run('npx', changelogArgs, { cwd: pkgDirPath })

  const { stdout } = await run('git', ['diff'], { stdio: 'pipe' })
  if (stdout) {
    step('\nCommitting changes...')
    await runIfNotDry('git', ['add', '-A'])
    await runIfNotDry('git', ['commit', '-m', `feat: release ${tag}`])
    await runIfNotDry('git', ['tag', tag])
  } else {
    console.log('No changes to commit.')
    return
  }

  step('\nPushing to GitHub...')
  await runIfNotDry('git', ['push', 'origin', `refs/tags/${tag}`])
  await runIfNotDry('git', ['push'])

  if (isDryRun) {
    console.log(`\nDry run finished - run git diff to see package changes.`)
  } else {
    console.log(
      colors.green('\nPushed, publishing should starts shortly on CI.')
    )
  }

  console.log()
}

bootstrap().catch((err) => {
  console.error(err)
  process.exit(1)
})
