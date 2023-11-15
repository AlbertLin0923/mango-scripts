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
  },
])
