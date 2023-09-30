import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    {
      builder: 'mkdist',
      input: 'src',
      outDir: 'dist/cjs',
      format: 'cjs',
      ext: 'js',
    },
  ],
  clean: true,
  declaration: true,
})
