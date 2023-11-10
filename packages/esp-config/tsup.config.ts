import { defineConfig } from 'tsup'

export default defineConfig([
  {
    format: 'cjs',
    entry: ['src'],
    outDir: 'dist/cjs',
    bundle: false,
    splitting: true,
    clean: true,
    dts: true,
    shims: true,
    cjsInterop: true,
    outExtension() {
      return {
        js: `.cjs`,
      }
    },
  },
])
