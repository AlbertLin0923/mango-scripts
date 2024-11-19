// Inspired by https://github.com/vitejs/vite/blob/main/scripts

import path from 'node:path'

import {
  pico,
  minimist,
  consola,
  inquirer,
  getMonorepoPkgListInfo,
} from '@mango-scripts/utils'

import {
  confirmRegistry,
  confirmGitBranch,
  confirmWorktreeEmpty,
  confirmNpmLoggedIn,
} from './confirmEnv.mjs'
import { updateVersion, updateDepVersion, updateChangelog } from './update.mjs'
import { getDiffPkgList } from './diff.mjs'
import { setPkgTargetVersion } from './version.mjs'

import { run, step } from '../../utils/index.mjs'

import type { Pkg } from './type.mjs'

export const publish = async (tag: string) => {
  if (!tag || !tag.includes('@')) throw new Error('无效的发布TAG')

  const [pkgName, version] = tag.split(/@(.+)/)
  const rawPkgName = pkgName.split('/')[1]
  const releaseType = version.match(/beta|alpha/)?.[0]

  step(`发布 ${pkgName} 中...`)

  const publicArgs = ['publish', '--access', 'public']

  if (releaseType) {
    publicArgs.push(`--tag`, releaseType)
  }
  publicArgs.push(`--no-git-checks`)

  await run('pnpm', publicArgs, {
    cwd: path.join(process.cwd(), `./packages/${rawPkgName}`),
  })
}

export const release = async (): Promise<void> => {
  // if (!(await confirmGitBranch()) || !(await confirmWorktreeEmpty())) return

  const { publishType } = await inquirer.prompt([
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

  step(`已选择 ${publishType === 'local' ? '[本地打包发布]' : '[远程CI发布]'}`)

  if (publishType === 'local') {
    if (!(await confirmRegistry()) || !(await confirmNpmLoggedIn())) return
  } else {
    consola.info(
      pico.red(`使用[远程CI发布]前，你需要确认远程CI上已配置 publish 命令`),
    )
  }

  const pkgList = await getMonorepoPkgListInfo()

  const diffPkgList = await getDiffPkgList(pkgList)

  const { selectedPkg } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedPkg',
      message: '选择待发布的包',
      choices: diffPkgList.map((pkg) => {
        const commitInfo = pkg?.commitList?.length
          ? pico.green(` [新增 ${pkg?.commitList?.length} commit]`)
          : ''
        const depChangedInfo =
          pkg.changedDep && pkg.changedDep?.length > 0
            ? pico.magenta(
                ` [依赖更新][${pkg.changedDep.map((it: { pkg: Pkg; level: number[] }) => `${it.pkg.pkgName}<${it.level.join(',')}级依赖>`).join(', ')}]`,
              )
            : ''
        return {
          name: `${pkg.pkgName}${commitInfo}${depChangedInfo}`,
          value: pkg,
        }
      }),
      loop: false,
      pageSize: 100,
    },
  ])

  if (!selectedPkg) return

  const { pkgName, pkgJsonFilePath, pkgDirPath, commitList } = selectedPkg

  console.log()
  commitList?.length &&
    consola.info(`最近 commit：
${commitList.join('\n')}  
      `)

  const pkgTargetVersion = await setPkgTargetVersion(selectedPkg)

  if (!pkgTargetVersion) return

  const tag = `${pkgName}@${pkgTargetVersion}`

  const { isTagRight }: { isTagRight: boolean } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'isTagRight',
      message: `当前的发布TAG： ${pico.yellow(tag)}，确定？`,
    },
  ])

  if (!isTagRight) return

  const { isPublishAlready }: { isPublishAlready: boolean } =
    await inquirer.prompt([
      {
        type: 'confirm',
        name: 'isPublishAlready',
        message: `确定开始发布？`,
        default: false,
      },
    ])

  if (!isPublishAlready) {
    console.error('已取消发布')
    return
  }

  step('升级 package.json 版本号...')
  await updateVersion(pkgJsonFilePath, pkgTargetVersion)

  step('升级 package.json 依赖版本号...')
  await updateDepVersion(pkgJsonFilePath, pkgList)

  step('生成 changelog...')
  await updateChangelog(pkgDirPath, pkgName)

  const { stdout } = await run('git', ['diff'], { stdio: 'pipe' })
  if (stdout) {
    step('提交version、changelog等代码变更...')
    await run('git', ['add', '-A'])
    await run('git', ['commit', '-m', `feat: release ${tag}`])
    await run('git', ['tag', tag])
  } else {
    consola.info('无变更')
    return
  }

  step('推送到远程分支...')
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
        `
    推送到远程仓库成功，远程打包部署即将启动，请在远程仓库查看状态
    `,
      ),
    )
  }
}

const releasePackage = async () => {
  const { tag } = minimist(process.argv.slice(2))
  tag ? publish(tag) : release()
}

export default releasePackage
