module.exports = {
  semi: false,
  tabWidth: 2,
  singleQuote: true,
  printWidth: 80,
  trailingComma: 'none',
  proseWrap: 'never',
  endOfLine: 'auto',
  overrides: [
    {
      files: '.prettierrc',
      options: {
        parser: 'json'
      }
    }
  ]
}
