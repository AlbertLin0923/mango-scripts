import { defineConfig } from 'tsup'

export default defineConfig([
  {
    format: 'cjs',
    entry: ['src'],
    outDir: 'dist/cjs',
    bundle: false,
    // https://github.com/egoist/tsup/issues/992
    splitting: true,
    clean: true,
    dts: true,
    shims: true,
    cjsInterop: true,
    loader: {
      '.applescript': 'copy',
    },
  },
])
