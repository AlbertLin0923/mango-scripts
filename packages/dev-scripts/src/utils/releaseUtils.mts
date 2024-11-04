import path from 'node:path'

import { fs, execa, pico, semver, consola, prompts } from '@mango-scripts/utils'

export const getPkgInfoList = async (): Promise<
  {
    pkgDir: string
    pkgDirPath: string
    pkgJsonFilePath: string
    pkgName: string
    pkgCurrentVersion: string
  }[]
> => {
  const pkgInfoList = []
  const targetDirPath = path.resolve(process.cwd(), './packages')
  const pkgDirList = await fs.readdir(targetDirPath)

  for (const pkgDir of pkgDirList) {
    const pkgDirPath = path.join(targetDirPath, pkgDir)
    const pkgJsonFilePath = path.join(pkgDirPath, 'package.json')
    if (await fs.pathExists(pkgJsonFilePath)) {
      const { name: pkgName, version: pkgCurrentVersion } =
        await fs.readJSON(pkgJsonFilePath)
      pkgInfoList.push({
        pkgDir,
        pkgDirPath,
        pkgJsonFilePath,
        pkgName,
        pkgCurrentVersion,
      })
    }
  }

  return pkgInfoList
}

export async function run(
  bin: string,
  args: string[],
  opts: any = {},
): Promise<any> {
  return execa(bin, args, { stdio: 'inherit', ...opts })
}

export const step = (msg: string) => {
  return consola.info(pico.cyan(msg))
}

export const getVersionChoices = (pkgCurrentVersion: string) => {
  const currentBeta = pkgCurrentVersion.includes('beta')
  const currentAlpha = pkgCurrentVersion.includes('alpha')
  const isStable = !currentBeta && !currentAlpha

  function inc(i: semver.ReleaseType, tag = currentAlpha ? 'alpha' : 'beta') {
    return semver.inc(pkgCurrentVersion, i, tag) as string
  }

  let versionChoices = [
    {
      title: 'next',
      value: inc(isStable ? 'patch' : 'prerelease'),
    },
  ]

  if (isStable) {
    versionChoices.push(
      {
        title: 'beta-minor',
        value: inc('preminor'),
      },
      {
        title: 'beta-major',
        value: inc('premajor'),
      },
      {
        title: 'alpha-minor',
        value: inc('preminor', 'alpha'),
      },
      {
        title: 'alpha-major',
        value: inc('premajor', 'alpha'),
      },
      {
        title: 'minor',
        value: inc('minor'),
      },
      {
        title: 'major',
        value: inc('major'),
      },
    )
  } else if (currentAlpha) {
    versionChoices.push({
      title: 'beta',
      value: inc('patch') + '-beta.0',
    })
  } else {
    versionChoices.push({
      title: 'stable',
      value: inc('patch'),
    })
  }
  versionChoices.push({ value: 'custom', title: 'custom' })

  versionChoices = versionChoices.map((i) => {
    i.title = `${i.title} (${i.value})`
    return i
  })

  return versionChoices
}

export const updateVersion = async (
  pkgPath: string,
  version: string,
): Promise<void> => {
  const pkg = await fs.readJSON(pkgPath)
  pkg.version = version
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
}

// 获取与指定包名相关的最新 Git 标签
export const getLatestTagForPackage = async (pkgName: string) => {
  const tags = (await run('git', ['tag'], { stdio: 'pipe' })).stdout
    .split('\n')
    .filter(Boolean)
  return tags
    .filter((tag: string) => tag.startsWith(`${pkgName}@`))
    .sort()
    .reverse()[0]
}

// 返回特定包的提交列表
export const logCommitsForPackage = async (
  pkgName: string,
): Promise<string[]> => {
  const latestTag = await getLatestTagForPackage(pkgName)

  console.log('latestTag', latestTag)
  let commits: string[] = []

  if (latestTag) {
    const sha = await run('git', ['rev-list', '-n', '1', latestTag], {
      stdio: 'pipe',
    }).then((res) => res.stdout.trim())

    commits = (
      await run(
        'git',
        [
          '--no-pager',
          'log',
          `${sha}..HEAD`,
          '--oneline',
          '--',
          `packages/${pkgName}`,
        ],
        { stdio: 'pipe' },
      )
    ).stdout
      .split('\n')
      .filter(Boolean)
  } else {
    commits = (
      await run(
        'git',
        ['--no-pager', 'log', '--oneline', '--', `packages/${pkgName}`],
        { stdio: 'pipe' },
      )
    ).stdout
      .split('\n')
      .filter(Boolean)
  }

  return commits
}

export const publishPkg = async (
  pkdDir: string,
  tag?: string,
): Promise<void> => {
  const publicArgs = ['publish', '--access', 'public']
  if (tag) {
    publicArgs.push(`--tag`, tag)
  }
  publicArgs.push(`--no-git-checks`)
  await run('pnpm', publicArgs, {
    cwd: pkdDir,
  })
}

export const isWorktreeEmpty = async () => {
  return !(await execa('git', ['status', '--porcelain']))?.stdout
}

export const confirmRegistry = async () => {
  const registry = (await execa('npm', ['config', 'get', 'registry'])).stdout

  const { yes }: { yes: boolean } = await prompts({
    type: 'confirm',
    name: 'yes',
    message: `当前 npm registry 为: ${pico.yellow(registry)}，确定? `,
  })

  return yes
}
