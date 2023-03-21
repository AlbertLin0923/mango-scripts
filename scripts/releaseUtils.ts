// Forked from https://github.com/vitejs/vite/blob/main/scripts/releaseUtils.ts

import path from 'node:path'
import pico from 'picocolors'
import type { Options as ExecaOptions, ExecaReturnValue } from 'execa'
import { execa } from 'execa'
import type { ReleaseType } from 'semver'
import semver from 'semver'
import fs from 'fs-extra'
import minimist from 'minimist'

export interface IPkgInfo {
  pkgName: string
  pkgPath: string
  pkgDirPath: string
  pkgCurrentVersion: string
}

export const args = minimist(process.argv.slice(2))

export const isDryRun = !!args.dry

if (isDryRun) {
  console.log(pico.inverse(pico.yellow(' DRY RUN ')))
  console.log()
}

export async function getPkgInfoList(targetDir: string): Promise<IPkgInfo[]> {
  const pkgInfoList: IPkgInfo[] = []

  const pkgDirList: string[] = fs.readdirSync(targetDir).filter((filename) => filename[0] !== '.')

  await Promise.all(
    pkgDirList.map(async (pkgDir) => {
      const pkgDirPath = path.join(targetDir, pkgDir)
      const pkgPath = path.join(pkgDirPath, 'package.json')

      const pkgInfo = await fs.readJSON(pkgPath)

      pkgInfoList.push({
        pkgName: pkgInfo.name,
        pkgPath,
        pkgDirPath,
        pkgCurrentVersion: pkgInfo.version
      })
    })
  )
  return pkgInfoList
}

export async function run(
  bin: string,
  args: string[],
  opts: ExecaOptions<string> = {}
): Promise<ExecaReturnValue<string>> {
  return execa(bin, args, { stdio: 'inherit', ...opts })
}

export async function dryRun(bin: string, args: string[], opts?: ExecaOptions<string>) {
  return console.log(pico.blue(`[dryrun] ${bin} ${args.join(' ')}`), opts || '')
}

export const runIfNotDry = isDryRun ? dryRun : run

export function step(msg: string) {
  return console.log(pico.cyan(msg))
}

export function getVersionChoices(pkgCurrentVersion: string) {
  const currentBeta = pkgCurrentVersion.includes('beta')
  const currentAlpha = pkgCurrentVersion.includes('alpha')
  const isStable = !currentBeta && !currentAlpha

  function inc(i: ReleaseType, tag = currentAlpha ? 'alpha' : 'beta') {
    return semver.inc(pkgCurrentVersion, i, tag) as string
  }

  let versionChoices = [
    {
      title: 'next',
      value: inc(isStable ? 'patch' : 'prerelease')
    }
  ]

  if (isStable) {
    versionChoices.push(
      {
        title: 'beta-minor',
        value: inc('preminor')
      },
      {
        title: 'beta-major',
        value: inc('premajor')
      },
      {
        title: 'alpha-minor',
        value: inc('preminor', 'alpha')
      },
      {
        title: 'alpha-major',
        value: inc('premajor', 'alpha')
      },
      {
        title: 'minor',
        value: inc('minor')
      },
      {
        title: 'major',
        value: inc('major')
      }
    )
  } else if (currentAlpha) {
    versionChoices.push({
      title: 'beta',
      value: inc('patch') + '-beta.0'
    })
  } else {
    versionChoices.push({
      title: 'stable',
      value: inc('patch')
    })
  }
  versionChoices.push({ value: 'custom', title: 'custom' })

  versionChoices = versionChoices.map((i) => {
    i.title = `${i.title} (${i.value})`
    return i
  })

  return versionChoices
}

export async function updateVersion(pkgPath: string, version: string): Promise<void> {
  const pkg = await fs.readJSON(pkgPath)
  pkg.version = version
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
}

export async function publishPkg(pkdDir: string, tag?: string): Promise<void> {
  const publicArgs = ['publish', '--access', 'public']
  if (tag) {
    publicArgs.push(`--tag`, tag)
  }
  await runIfNotDry('npm', publicArgs, {
    cwd: pkdDir
  })
}

export async function getLatestTag(pkgName: string) {
  const tags = (await run('git', ['tag'], { stdio: 'pipe' })).stdout.split(/\n/).filter(Boolean)
  return tags
    .filter((tag) => tag.startsWith(`${pkgName}@`))
    .sort()
    .reverse()[0]
}

export async function logRecentCommits(pkgName: string) {
  const tag = await getLatestTag(pkgName)
  if (!tag) return
  const sha = await run('git', ['rev-list', '-n', '1', tag], {
    stdio: 'pipe'
  }).then((res) => res.stdout.trim())
  console.log(
    pico.bold(
      `\n${pico.blue(`i`)} Commits of ${pico.green(pkgName)} since ${pico.green(tag)} ${pico.gray(
        `(${sha.slice(0, 5)})`
      )}`
    )
  )
  await run(
    'git',
    ['--no-pager', 'log', `${sha}..HEAD`, '--oneline', '--', `packages/${pkgName}`],
    { stdio: 'inherit' }
  )
  console.log()
}
