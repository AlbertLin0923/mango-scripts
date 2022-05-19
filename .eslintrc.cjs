// @ts-check
const { defineConfig } = require('eslint-define-config')

module.exports = defineConfig({
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  plugins: ['import'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2021
  },
  rules: {
    '@typescript-eslint/no-var-requires': 'off',
    'node/no-unpublished-import': 'off',
    'node/no-unpublished-require': 'off',
    'no-process-exit': 'off',
    'node/no-unsupported-features/es-syntax': 'off',
    'node/no-missing-require': 'off',
    'node/shebang': 'off'
  },
  overrides: [
    {
      files: ['*.d.ts'],
      rules: {
        '@typescript-eslint/triple-slash-reference': 'off'
      }
    }
  ]
})
