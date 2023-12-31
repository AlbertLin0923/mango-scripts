import { defineConfig } from 'tsup'

export default defineConfig([
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
    loader: {
      '.applescript': 'copy',
    },
  },
])
