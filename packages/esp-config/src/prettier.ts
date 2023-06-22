const Config = {
  semi: false,
  singleQuote: true,
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

export default Config
