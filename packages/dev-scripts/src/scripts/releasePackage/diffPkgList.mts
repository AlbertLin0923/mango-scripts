import { fs, semver, lodash } from '@mango-scripts/utils'

import { run } from '../../utils/index.mjs'

import type { Pkg } from '../../utils/index.mjs'

const { uniq } = lodash

// 获取与指定包名相关的最新 Git 标签
const getLatestTagForPkg = async (pkg: Pkg) => {
  const tags = (await run('git', ['tag'], { stdio: 'pipe' })).stdout
    .split('\n')
    .filter((tag: string) => tag.startsWith(`${pkg.pkgName}@`))
    .map((tag: string) => tag.replace(`${pkg.pkgName}@`, ''))
    .filter(semver.valid)
    .sort(semver.rcompare)

  return tags[0] ? `${pkg.pkgName}@${tags[0]}` : undefined
}

// 记录指定包的最近提交列表
export const logRecentCommitListForPkg = async (
  pkg: Pkg,
): Promise<string[]> => {
  const latestTag = await getLatestTagForPkg(pkg)
  const logRange = latestTag ? `${latestTag}..HEAD` : 'HEAD'

  const commitFormat = [
    '--no-pager',
    'log',
    logRange,
    '--color',
    '--graph',
    '--pretty=format:%C(Magenta)[%cd]%Cgreen(%cr)%C(bold blue)<%an>%Creset %Cred%h%Creset -%C(yellow)%d%Creset %s',
    '--date=format:%Y-%m-%d %H:%M:%S',
    '--abbrev-commit',
    '--',
    `packages/${pkg.pkgDir}`,
  ]

  return (
    (await run('git', commitFormat, { stdio: 'pipe' }))?.stdout
      ?.split('\n')
      ?.filter(Boolean) || []
  )
}

// 获取包的依赖列表
const getDepNameList = async ({ pkgJsonFilePath }: Pkg) => {
  if (!(await fs.pathExists(pkgJsonFilePath))) return []
  const { dependencies = {}, devDependencies = {} } =
    await fs.readJson(pkgJsonFilePath)
  return uniq([...Object.keys(dependencies), ...Object.keys(devDependencies)])
}
/**
对于packages目录下的内部包：A B C D E F G，
A依赖B，A依赖C，B依赖C，B依赖D，F，G无内部包依赖

输出：
const map = [
  {
    pkg: 'A',
    deps: [
      { pkg: 'B', level: [1] },
      { pkg: 'C', level: [1, 2] },
      { pkg: 'D', level: [2] },
    ],
  },
  {
    pkg: 'B',
    deps: [
      { pkg: 'C', level: [1] },
      { pkg: 'D', level: [1] },
    ],
  },
  {
    pkg: 'C',
    deps: [],
  },
  {
    pkg: 'D',
    deps: [],
  },
  {
    pkg: 'E',
    deps: [],
  },
  {
    pkg: 'F',
    deps: [],
  },
  {
    pkg: 'G',
    deps: [],
  },
]
*/
const generateDependencyMap = async (allPkgList: Pkg[]) => {
  const pkgLevelCache: Map<string, number[]> = new Map()

  const getPkgLevels = async (pkg: Pkg, level = 1): Promise<number[]> => {
    // 如果缓存中已有层级数据，直接返回
    if (pkgLevelCache.has(pkg.pkgName)) {
      return pkgLevelCache.get(pkg.pkgName) || []
    }

    const depNameList = await getDepNameList(pkg)
    const depsWithLevel: number[] = [level]

    // 遍历当前包的依赖，递归计算依赖层级
    for (const depName of depNameList) {
      const depPkg = allPkgList.find((p) => p.pkgName === depName)
      if (depPkg) {
        const depLevels = await getPkgLevels(depPkg, level + 1)
        depsWithLevel.push(...depLevels)
      }
    }

    // 缓存当前包的层级数据
    pkgLevelCache.set(pkg.pkgName, uniq(depsWithLevel))
    return pkgLevelCache.get(pkg.pkgName) || []
  }

  const dependencyMap: { pkg: Pkg; deps: { pkg: Pkg; level: number[] }[] }[] =
    []

  // 遍历所有包，生成每个包的依赖树
  for (const pkg of allPkgList) {
    const deps = []
    const depNameList = await getDepNameList(pkg)

    // 对每个依赖包，计算它的层级并生成依赖关系
    for (const depName of depNameList) {
      const depPkg = allPkgList.find((p) => p.pkgName === depName)
      if (depPkg) {
        const depLevels = await getPkgLevels(depPkg)
        deps.push({ pkg: depPkg, level: depLevels })
      }
    }

    dependencyMap.push({ pkg, deps })
  }

  return dependencyMap
}

const addChangedDepInfoForPkgList = async (
  pkgListWithCommitList: Pkg[],
  pkgList: Pkg[],
) => {
  const dependency = await generateDependencyMap(pkgList)
  return pkgList.map((pkg) => {
    const pkgDependency = dependency.find(
      ({ pkg: { pkgName } }) => pkgName === pkg.pkgName,
    )

    return {
      ...pkg,
      changedDep:
        pkgDependency &&
        pkgDependency?.deps.filter((dep: { pkg: Pkg; level: number[] }) =>
          pkgListWithCommitList.findIndex(
            (d: Pkg) => dep.pkg.pkgName === d.pkgName,
          ),
        ),
      commitList:
        pkgListWithCommitList.find((dep: Pkg) => dep.pkgName === pkg.pkgName)
          ?.commitList ?? [],
    }
  })
}

export const getDiffPkgList = async (pkgList: Pkg[]) => {
  const pkgListWithCommitList = (
    await Promise.all(
      pkgList.map(async (pkg) => {
        return { ...pkg, commitList: await logRecentCommitListForPkg(pkg) }
      }),
    )
  ).filter((pkg) => {
    return pkg.commitList.length > 0
  })

  return await addChangedDepInfoForPkgList(pkgListWithCommitList, pkgList)
}
