export default {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-standard-scss',
    'stylelint-config-css-modules',
    'stylelint-config-rational-order',
    'stylelint-config-prettier'
  ],
  plugins: [],
  rules: {},
  ignoreFiles: ['**/*.js', '**/*.jsx', '**/*.tsx', '**/*.ts'],
  overrides: [
    {
      files: ['**/*.less'],
      customSyntax: 'postcss-less'
    },
    {
      files: ['**/*.styl', '**/*.stylus'],
      customSyntax: 'postcss-styl'
    }
  ]
}
