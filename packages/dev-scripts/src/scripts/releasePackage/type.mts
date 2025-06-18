export type Pkg = {
  pkgDir: string
  pkgDirPath: string
  pkgJsonFilePath: string
  pkgName: string
  pkgCurrentVersion: string
  latestTag?: string
  commitList?: string[]
  deps?: Pkg[]
}

export type RepoType = 'monorepo' | 'polyrepo'

export type PublishType = 'remote' | 'local'
