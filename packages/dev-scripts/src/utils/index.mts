import path from 'node:path'

import fs from 'fs-extra'
import { execa } from 'execa'
import pico from 'picocolors'
import semver from 'semver'

import type { ReleaseType } from 'semver'
import type { Options as ExecaOptions, ExecaReturnValue } from 'execa'

export interface IPkgInfo {
  pkgDir: string
  pkgDirPath: string
  pkgJsonFilePath: string
  pkgName: string
  pkgCurrentVersion: string
}

export async function getPkgInfoList(
  targetDirList: string[],
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
          pkgCurrentVersion: packageJson?.version,
        })
      }
    }
  }

  return pkgInfoList
}

export async function run(
  bin: string,
  args: string[],
  opts: ExecaOptions<'utf8'> = {},
): Promise<ExecaReturnValue<string>> {
  return execa(bin, args, { stdio: 'inherit', ...opts })
}

export const step = (msg: string) => {
  return console.log(pico.cyan(msg))
}

export const getVersionChoices = (pkgCurrentVersion: string) => {
  const currentBeta = pkgCurrentVersion.includes('beta')
  const currentAlpha = pkgCurrentVersion.includes('alpha')
  const isStable = !currentBeta && !currentAlpha

  function inc(i: ReleaseType, tag = currentAlpha ? 'alpha' : 'beta') {
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

export const getLatestTag = async (pkgName: string) => {
  const tags = (await run('git', ['tag'], { stdio: 'pipe' })).stdout
    .split(/\n/)
    .filter(Boolean)
  return tags
    .filter((tag) => tag.startsWith(`${pkgName}@`))
    .sort()
    .reverse()[0]
}

export const logRecentCommits = async (pkgName: string) => {
  const tag = await getLatestTag(pkgName)
  if (!tag) return
  const sha = await run('git', ['rev-list', '-n', '1', tag], {
    stdio: 'pipe',
  }).then((res) => res.stdout.trim())
  console.log(
    pico.bold(
      `\n${pico.blue(`i`)} Commits of ${pico.green(pkgName)} since ${pico.green(
        tag,
      )} ${pico.gray(`(${sha.slice(0, 5)})`)}`,
    ),
  )
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
    { stdio: 'inherit' },
  )
  console.log()
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
