import { join } from 'path'

import { describe, expect, test } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'fs-extra'
import { transformFileSync } from '@babel/core'

describe('test babel plugin auto react css modules', () => {
  const fixturesDir = join(__dirname, 'fixtures')

  readdirSync(fixturesDir).map((caseName) => {
    const fixtureDir = join(fixturesDir, caseName)
    if (!statSync(fixtureDir).isDirectory()) return

    const actualFilePath = join(fixtureDir, 'actual.ts')
    const expectedFilePath = join(fixtureDir, 'expected.ts')

    test(`should work with ${caseName.split('-').join(' ')}`, () => {
      const actual = transformFileSync(actualFilePath, {
        presets: ['@babel/preset-env', '@babel/preset-typescript'],
        plugins: [
          '@babel/plugin-transform-runtime',
          [require.resolve('../src/index.ts')],
        ],
        babelrc: false,
        configFile: false,
      })?.code

      const expected = readFileSync(expectedFilePath, 'utf8')
      expect(actual?.trim()).toEqual(expected?.trim())
    })
  })
})
