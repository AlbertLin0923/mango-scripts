import { semver, inquirer, consola } from '@mango-scripts/utils'
import packageJson from 'package-json'

import type { Pkg } from '../../utils/index.mjs'

const getVersionChoices = (pkgCurrentVersion: string) => {
  const currentBeta = pkgCurrentVersion.includes('beta')
  const currentAlpha = pkgCurrentVersion.includes('alpha')
  const isStable = !currentBeta && !currentAlpha

  function inc(i: semver.ReleaseType, tag = currentAlpha ? 'alpha' : 'beta') {
    return semver.inc(pkgCurrentVersion, i, tag) as string
  }

  let versionChoices = [
    {
      name: 'next',
      value: inc(isStable ? 'patch' : 'prerelease'),
    },
  ]

  if (isStable) {
    versionChoices.push(
      {
        name: 'beta-minor',
        value: inc('preminor'),
      },
      {
        name: 'beta-major',
        value: inc('premajor'),
      },
      {
        name: 'alpha-minor',
        value: inc('preminor', 'alpha'),
      },
      {
        name: 'alpha-major',
        value: inc('premajor', 'alpha'),
      },
      {
        name: 'minor',
        value: inc('minor'),
      },
      {
        name: 'major',
        value: inc('major'),
      },
    )
  } else if (currentAlpha) {
    versionChoices.push({
      name: 'beta',
      value: inc('patch') + '-beta.0',
    })
  } else {
    versionChoices.push({
      name: 'stable',
      value: inc('patch'),
    })
  }
  versionChoices.push({ value: 'custom', name: 'custom' })

  versionChoices = versionChoices.map((i) => {
    i.name = `${i.name} (${i.value})`
    return i
  })

  return versionChoices
}

export const setPkgTargetVersion = async (pkg: Pkg) => {
  const { pkgName, pkgCurrentVersion } = pkg
  let pkgTargetVersion: string

  const remotePkgJson = await packageJson(pkgName)

  const { releaseType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'releaseType',
      message: `选择发包版本 ${remotePkgJson ? `[远程npm registry版本号: ${remotePkgJson.version}]` : null}`,
      choices: getVersionChoices(pkgCurrentVersion),
      loop: false,
    },
  ])

  if (releaseType === 'custom') {
    const res: { version: string } = await inquirer.prompt([
      {
        type: 'input',
        name: 'version',
        message: '输入自定义版本号',
        default: pkgCurrentVersion,
      },
    ])
    pkgTargetVersion = res.version
  } else {
    pkgTargetVersion = releaseType
  }

  if (!semver.valid(pkgTargetVersion)) {
    consola.error(`不合法的版本号: ${pkgTargetVersion}，请检查`)
    return false
  }

  if (
    remotePkgJson &&
    semver.lt(pkgTargetVersion, remotePkgJson.version as string)
  ) {
    consola.error(
      `本地版本号 ${pkgCurrentVersion} 低于远程 npm registry 版本号 ${remotePkgJson.version}，请检查`,
    )
    return false
  }
  return pkgTargetVersion
}
