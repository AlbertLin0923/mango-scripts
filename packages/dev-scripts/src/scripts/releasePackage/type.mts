export type Pkg = {
  pkgDir: string
  pkgDirPath: string
  pkgJsonFilePath: string
  pkgName: string
  pkgCurrentVersion: string
  latestTag?: string
  commitList?: string[]
  changedDep?: Pkg[]
}
