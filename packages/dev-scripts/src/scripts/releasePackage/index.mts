// Inspired by https://github.com/vitejs/vite/blob/main/scripts

import path from 'node:path'

import {
  fs,
  pico,
  minimist,
  consola,
  inquirer,
  semver,
  getMonorepoPkgListInfo,
} from '@mango-scripts/utils'

import {
  confirmRegistry,
  confirmGitBranch,
  confirmWorktreeEmpty,
  confirmNpmLoggedIn,
} from './confirmEnv.mjs'
import { updateVersion, updateDepVersion, updateChangelog } from './update.mjs'
import {
  addDiffInfoForPkgListInMonorepo,
  addDiffInfoForPkgInPolyrepo,
} from './diff.mjs'
import { getPkgTargetVersion } from './version.mjs'

import {
  run,
  step,
  getPolyrepoPkgInfo,
  renderDepTree,
  getDepsChange,
} from '../../utils/index.mjs'

import type { Pkg, RepoType, PublishType } from './type.mjs'

const isValidTag = (tag: string): boolean => {
  const monorepoTag = /^@[^@]+\/[^@]+@\d+\.\d+\.\d+(-[a-z]+\.\d+)?$/
  const polyrepoTag = /^v\d+\.\d+\.\d+(-[a-z]+\.\d+)?$/
  return monorepoTag.test(tag) || polyrepoTag.test(tag)
}

export const publish = async (tag: string) => {
  if (!isValidTag(tag)) throw new Error(`❌ 无效的发布 TAG：${tag}`)

  let pkgName: string
  let version: string
  let publishDir: string

  if (tag.startsWith('@')) {
    // monorepo 模式
    const i = tag.lastIndexOf('@')
    pkgName = tag.slice(0, i)
    version = tag.slice(i + 1)
    publishDir = path.join(process.cwd(), 'packages', pkgName.split('/')[1])
  } else {
    // polyrepo 模式
    version = tag.replace(/^v/, '')
    const { name } = await fs.readJSON(path.join(process.cwd(), 'package.json'))
    pkgName = name
    publishDir = process.cwd()
  }

  if (!semver.valid(version)) {
    throw new Error(`❌ 非法版本号：${version}`)
  }

  const releaseType = version.includes('beta')
    ? 'beta'
    : version.includes('alpha')
      ? 'alpha'
      : undefined

  step(`正在发布 ${pkgName}@${version} ...`)

  const args = ['publish', '--access', 'public', '--no-git-checks']
  if (releaseType) args.push('--tag', releaseType)

  await run('pnpm', args, { cwd: publishDir })
}

export const release = async (): Promise<void> => {
  if (!(await confirmGitBranch()) || !(await confirmWorktreeEmpty())) return

  const { repoType } = await inquirer.prompt<{ repoType: RepoType }>([
    {
      type: 'list',
      name: 'repoType',
      message: '选择仓库管理方式',
      choices: [
        { name: 'Monorepo', value: 'monorepo' },
        { name: 'Polyrepo', value: 'polyrepo' },
      ],
    },
  ])

  const isMonorepo = repoType === 'monorepo'

  const { publishType } = await inquirer.prompt<{ publishType: PublishType }>([
    {
      type: 'list',
      name: 'publishType',
      message: '选择发布方式',
      choices: [
        { name: '远程CI发布', value: 'remote' },
        { name: '本地打包发布', value: 'local' },
      ],
    },
  ])

  if (publishType === 'remote') {
    console.log()
    consola.log(
      pico.magenta(
        `注意：使用[远程CI发布]前，你需要确认远程CI上已配置 publish 命令`,
      ),
    )
    console.log()
  } else {
    if (!(await confirmRegistry()) || !(await confirmNpmLoggedIn())) return
  }

  let selectedPkg: Pkg
  let pkgListOfMonorepo: Pkg[] = []

  if (isMonorepo) {
    const pkgList = await getMonorepoPkgListInfo()

    pkgListOfMonorepo = pkgList

    const diffPkgList = await addDiffInfoForPkgListInMonorepo(pkgList)

    const { userSelectedPkg } = await inquirer.prompt<{ userSelectedPkg: Pkg }>(
      [
        {
          type: 'list',
          name: 'userSelectedPkg',
          message: '请选择要发布的包',
          choices: diffPkgList.map((pkg) => {
            const hasCommits = pkg.commitList && pkg.commitList?.length > 0
            const hasDepsChange = getDepsChange(pkg?.deps || [])

            return {
              name: `${pkg.pkgName}${hasCommits ? pico.magenta('  [有代码变动]') : ''}${hasDepsChange ? pico.green('  [有依赖变动]') : ''}`,
              value: pkg,
            }
          }),
        },
      ],
    )

    selectedPkg = userSelectedPkg
  } else {
    const pkg = await getPolyrepoPkgInfo()
    const diffPkg = await addDiffInfoForPkgInPolyrepo(pkg)
    selectedPkg = diffPkg
  }

  if (!selectedPkg) return

  const { pkgName, pkgJsonFilePath, pkgDirPath, commitList, deps } = selectedPkg

  if (commitList?.length) {
    console.log(`\n${pico.green('Commit：')}`)
    console.log(`${commitList.join('\n')}`)
  }

  if (getDepsChange(deps || [])) {
    console.log(`\n${pico.green('Deps：')}`)
    console.log(`${renderDepTree(deps ?? [])}\n`)
  }

  const { isCommitOk } = await inquirer.prompt<{ isCommitOk: boolean }>([
    {
      type: 'confirm',
      name: 'isCommitOk',
      message: '请确认发布内容是否正确？',
    },
  ])

  if (!isCommitOk) return

  const pkgTargetVersion = await getPkgTargetVersion(selectedPkg)

  if (!pkgTargetVersion) return

  const tag = isMonorepo
    ? `${pkgName}@${pkgTargetVersion}`
    : `v${pkgTargetVersion}`

  const { isTagOk } = await inquirer.prompt<{ isTagOk: boolean }>([
    {
      type: 'confirm',
      name: 'isTagOk',
      message: `当前的发布TAG：${pico.cyan(tag)} ，确定？`,
    },
  ])

  if (!isTagOk) return

  const { isPublishOk } = await inquirer.prompt<{
    isPublishOk: boolean
  }>([
    {
      type: 'confirm',
      name: 'isPublishOk',
      message: `确定开始发布？`,
    },
  ])

  if (!isPublishOk) {
    console.error('已取消发布')
    return
  }

  await updateVersion(pkgJsonFilePath, pkgTargetVersion)

  if (isMonorepo) {
    await updateDepVersion(pkgJsonFilePath, pkgListOfMonorepo)
  }

  step('生成 CHANGELOG')
  await updateChangelog(pkgDirPath, pkgName, isMonorepo)

  const { stdout } = await run('git', ['diff'], { stdio: 'pipe' })
  if (stdout) {
    step('提交 version、CHANGELOG 等代码变更')
    await run('git', ['add', '-A'])
    await run('git', ['commit', '-m', `feat: release ${tag}`])
    await run('git', ['tag', tag])
  } else {
    consola.info('无变更')
    return
  }

  step('推送到远程分支')
  await run('git', ['push', 'origin', `refs/tags/${tag}`])
  await run('git', ['push'])

  if (publishType === 'local') {
    step('本地打包中...')
    await run('pnpm', ['run', 'build'], { cwd: process.cwd() })

    step('上传到 npm...')
    publish(tag)
  } else {
    consola.success(
      pico.green(
        '推送到远程仓库成功，远程打包部署即将启动，请在远程仓库CI查看状态',
      ),
    )
  }
}

const releasePackage = async () => {
  const { tag } = minimist(process.argv.slice(2))
  try {
    tag ? publish(tag) : release()
  } catch (error) {
    console.log(error)
  }
}

export default releasePackage
