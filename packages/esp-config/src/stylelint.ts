/** @type {import("stylelint").Config} */
const config = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-standard-scss',
    'stylelint-config-html',
    'stylelint-config-standard-vue',
    'stylelint-config-css-modules',
    'stylelint-config-rational-order',
    'stylelint-prettier/recommended',
  ],
  ignoreFiles: ['**/*.js', '**/*.jsx', '**/*.tsx', '**/*.ts'],
  overrides: [
    {
      files: ['*.less', '**/*.less'],
      customSyntax: 'postcss-less',
    },
    {
      files: ['*.styl', '**/*.styl', '*.stylus', '**/*.stylus'],
      customSyntax: 'postcss-styl',
    },
  ],
}

export default config
