import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  transform: {
    '.(ts|tsx)': 'ts-jest'
  },
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/tests/setup.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setupAfterEnv.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx)$',
  coveragePathIgnorePatterns: ['/node_modules/', '/test/'],
  collectCoverageFrom: ['src/*.{js,ts}', 'src/**/*.{js,ts}']
}

export default config
