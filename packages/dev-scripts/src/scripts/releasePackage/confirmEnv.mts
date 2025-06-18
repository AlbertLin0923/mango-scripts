import {
  pico,
  consola,
  inquirer,
  getGitRepoInfo,
  ora,
} from '@mango-scripts/utils'

import { run } from '../../utils/index.mjs'

export const confirmRegistry = async () => {
  const registry = (
    await run('npm', ['config', 'get', 'registry'], { stdio: 'pipe' })
  ).stdout

  const { isNpmRegistryOk } = await inquirer.prompt<{
    isNpmRegistryOk: boolean
  }>([
    {
      type: 'confirm',
      name: 'isNpmRegistryOk',
      message: `当前 npm registry 为: ${pico.cyan(registry)}，确定? `,
    },
  ])

  return isNpmRegistryOk
}

export const confirmGitBranch = async () => {
  const { branch } = getGitRepoInfo()
  const { isGitBranchOk } = await inquirer.prompt<{ isGitBranchOk: boolean }>([
    {
      type: 'confirm',
      name: 'isGitBranchOk',
      message: `当前发布的分支为: ${pico.cyan(branch)}，确定？`,
    },
  ])

  return isGitBranchOk
}

export const confirmWorktreeEmpty = async () => {
  const isWorktreeEmpty = !(
    await run('git', ['status', '--porcelain'], { stdio: 'pipe' })
  )?.stdout

  !isWorktreeEmpty &&
    consola.error('检测到当前工作区有尚未提交的代码，请先提交代码')

  return isWorktreeEmpty
}

export const confirmNpmLoggedIn = async () => {
  try {
    const spinner = ora().start(`获取 npm 登录状态...`)
    const user = (await run('npm', ['whoami'], { stdio: 'pipe' })).stdout.trim()
    spinner.stop()

    if (!user) {
      consola.error('检测到你尚未登录 npm，请使用 `npm login` 登录后再继续。')
      return false
    }

    const { isNpmUserOk } = await inquirer.prompt<{ isNpmUserOk: boolean }>([
      {
        type: 'confirm',
        name: 'isNpmUserOk',
        message: `当前登录的 npm 用户为: ${pico.cyan(user)}，确定？`,
      },
    ])

    return isNpmUserOk
  } catch (error) {
    consola.error('检测到您尚未登录 npm，请使用 `npm login` 登录后再继续。')
    return false
  }
}
