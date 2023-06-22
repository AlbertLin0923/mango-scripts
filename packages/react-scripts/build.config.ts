import type { BuildEntry } from 'unbuild'
import { defineBuildConfig } from 'unbuild'

const esmBuild: BuildEntry = {
  builder: 'mkdist',
  input: 'src',
  outDir: 'dist/esm',
  format: 'esm',
  ext: 'mjs'
}

const cjsBuild: BuildEntry = {
  builder: 'mkdist',
  input: 'src',
  outDir: 'dist/cjs',
  format: 'cjs',
  ext: 'js'
}

export default defineBuildConfig({
  entries: [esmBuild, cjsBuild],
  clean: true,
  declaration: true
})
