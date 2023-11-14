module.exports = {
  root: true,
  extends: [require.resolve('@mango-scripts/esp-config/eslint')],
  rules: {
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    'no-script-url': 'off',
    'react/no-array-index-key': 'off',
    'no-unsafe-optional-chaining': 'off',
    'no-param-reassign': 'off',
    'no-empty': 'off',
    '@typescript-eslint/method-signature-style': 'off',
  },
}
