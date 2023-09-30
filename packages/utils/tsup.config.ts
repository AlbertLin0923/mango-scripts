import { defineConfig } from 'tsup'

export default defineConfig([
  {
    format: 'cjs',
    entry: ['src'],
    outDir: 'dist/cjs',
    bundle: false,
    splitting: false,
    clean: true,
    dts: true,
    shims: true,
    outExtension() {
      return {
        js: `.cjs`,
      }
    },
  },
  {
    format: 'esm',
    entry: ['src'],
    outDir: 'dist/esm',
    bundle: false,
    splitting: false,
    clean: true,
    dts: true,
    shims: true,
    outExtension() {
      return {
        js: `.mjs`,
      }
    },
  },
])
