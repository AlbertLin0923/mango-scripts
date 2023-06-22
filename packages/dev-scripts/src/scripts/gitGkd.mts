import pico from 'picocolors'
import consola from 'consola'
import getGitRepoInfo from 'git-repo-info'
import { run } from '../utils/index.mjs'

type GitGkdOptionsType = {
  targetBranch: string[]
}

const gitGkd = async (options: GitGkdOptionsType): Promise<void> => {
  const { targetBranch } = options

  const { branch } = getGitRepoInfo()

  consola.info(pico.cyan(`now in branch: ${branch} \n`))

  consola.start(pico.cyan(`git pull origin ${branch}`))
  await run('git', ['pull', 'origin', `${branch}`])

  consola.start(pico.cyan(`git push origin ${branch}`))
  await run('git', ['push', 'origin', `${branch}`])

  for (let i = 0; i < targetBranch.length; i++) {
    const it = targetBranch[i]


    consola.start(pico.cyan(`git checkout ${it}`))
    await run('git', ['checkout', `${it}`])

    consola.start(pico.cyan(`git pull origin ${it}`))
    await run('git', ['pull', 'origin', `${it}`])

    consola.start(pico.cyan(`git merge ${branch}`))
    await run('git', ['merge', `${branch}`])

    consola.start(pico.cyan(`git push origin ${it}`))
    await run('git', ['push', 'origin', `${it}`])
  }


  consola.start(pico.cyan(`git checkout ${branch}`))
  await run('git', ['checkout', `${branch}`])
  
  consola.success(`${pico.green('done!')}`)
}

export default gitGkd
