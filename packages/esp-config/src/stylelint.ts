export default {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-standard-scss',
    'stylelint-config-css-modules',
    'stylelint-config-rational-order',
    'stylelint-config-prettier'
  ],
  ignoreFiles: ['**/*.js', '**/*.jsx', '**/*.tsx', '**/*.ts'],
  overrides: [
    {
      files: ['**/*.less'],
      customSyntax: require('postcss-less')
    },
    {
      files: ['**/*.styl', '**/*.stylus'],
      customSyntax: require('postcss-styl')
    }
  ]
}
