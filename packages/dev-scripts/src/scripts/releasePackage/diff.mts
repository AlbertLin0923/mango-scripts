import { fs, semver, lodash } from '@mango-scripts/utils'

import { run } from '../../utils/index.mjs'

import type { Pkg } from './type.mjs'

const { uniq } = lodash

const isValidVersion = (tag: string): boolean => Boolean(semver.valid(tag))

/**
 * 获取指定包的最新 Git tag。
 *
 * @param pkg - 包信息对象，包含包名等。
 * @param isMonorepo - 是否处于 monorepo 模式。
 * @returns 最新的 tag 字符串，例如 "pkg@1.2.3" 或 "v1.2.3"，若无则返回 undefined。
 */
export const getLatestTag = async (
  pkg: Pkg,
  isMonorepo: boolean = true,
): Promise<string | undefined> => {
  const tags: string[] = (await run('git', ['tag'], { stdio: 'pipe' })).stdout
    .split('\n')
    .map((tag: string) => tag.trim())
    .filter(Boolean)

  const filteredTags: string[] = isMonorepo
    ? tags
        .filter((tag) => tag.startsWith(`${pkg.pkgName}@`))
        .map((tag) => tag.replace(`${pkg.pkgName}@`, ''))
        .filter(isValidVersion)
    : tags
        .map((tag) => tag.replace(/^v/, '')) // 支持 v1.0.0 格式
        .filter(isValidVersion)

  const sortedTags = filteredTags.sort(semver.rcompare)

  const latestVersion = sortedTags?.[0]

  return latestVersion
    ? isMonorepo
      ? `${pkg.pkgName}@${latestVersion}`
      : `v${latestVersion}`
    : undefined
}

/**
 * 获取指定包的 Git 最近提交记录。
 *
 * @param pkg - 包信息
 * @param latestTag - 最近的 Git tag（可选）
 * @param isMonorepo - 是否是 monorepo 仓库结构
 * @returns 提交记录数组（每条为格式化字符串）
 */
export const getRecentCommitList = async (
  pkg: Pkg,
  latestTag?: string,
  isMonorepo: boolean = true,
): Promise<string[]> => {
  const logRange = latestTag ? `${latestTag}..HEAD` : 'HEAD'

  const targetPath = isMonorepo ? `packages/${pkg.pkgDir}` : '.'

  const arg = [
    '--no-pager',
    'log',
    logRange,
    '--color',
    '--graph',
    '--pretty=format:%C(Magenta)[%cd]%Cgreen(%cr)%C(bold blue)<%an>%Creset %Cred%h%Creset -%C(yellow)%d%Creset %s',
    '--date=format:%Y-%m-%d %H:%M:%S',
    '--abbrev-commit',
    '--',
    targetPath,
  ]

  const result = await run('git', arg, { stdio: 'pipe' })

  return result?.stdout?.split('\n').filter(Boolean) || []
}

/**
对于packages目录下的内部包：A B C D E，
A依赖B，A依赖C，B依赖C，B依赖D，E无内部包依赖

const map = [
  {
    pkg: 'A',
    deps: [
      {
        pkg: 'B',
        deps: [
          { pkg: 'C', deps: [] },
          { pkg: 'D', deps: [] },
        ],
      },
      { pkg: 'C', deps: [] },
    ],
  },
  {
    pkg: 'B',
    deps: [
      { pkg: 'C', deps: [] },
      { pkg: 'D', deps: [] },
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
] 
*/

// 获取包的依赖名称列表
const getDepNameList = async ({ pkgJsonFilePath }: Pkg): Promise<string[]> => {
  if (!(await fs.pathExists(pkgJsonFilePath))) return []
  const { dependencies = {}, devDependencies = {} } =
    await fs.readJson(pkgJsonFilePath)
  return uniq([...Object.keys(dependencies), ...Object.keys(devDependencies)])
}

// 构建依赖关系图
const generateDependencyMap = async (pkgList: Pkg[]): Promise<Pkg[]> => {
  // 递归解析依赖
  const resolveDeps = async (
    pkg: Pkg,
    seen = new Set<string>(),
  ): Promise<Pkg> => {
    seen.add(pkg.pkgName)

    const depNameList = await getDepNameList(pkg)

    const deps: Pkg[] = []

    for (const depName of depNameList) {
      const depPkg = pkgList.find((p) => p.pkgName === depName)
      if (!depPkg || seen.has(depPkg.pkgName)) continue

      const childDepTree = await resolveDeps(depPkg, new Set(seen))
      deps.push(childDepTree)
    }

    return {
      ...pkg,
      deps,
    }
  }

  const map: Pkg[] = []

  for (const pkg of pkgList) {
    const tree = await resolveDeps(pkg)
    map.push(tree)
  }

  return map
}

export const addDiffInfoForPkgListInMonorepo = async (pkgList: Pkg[]) => {
  const pkgWithGitInfo = await Promise.all(
    pkgList.map(async (pkg) => {
      const latestTag = await getLatestTag(pkg)
      const commitList = await getRecentCommitList(pkg, latestTag)
      return { ...pkg, latestTag, commitList }
    }),
  )

  const result = await generateDependencyMap(pkgWithGitInfo)
  return result
}

export const addDiffInfoForPkgInPolyrepo = async (pkg: Pkg) => {
  const latestTag = await getLatestTag(pkg, false)
  const commitList = await getRecentCommitList(pkg, latestTag, false)
  return { ...pkg, latestTag, commitList }
}
