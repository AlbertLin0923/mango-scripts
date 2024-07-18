/** @type {import("prettier").Config} */
const config = {
  semi: false,
  singleQuote: true,
  proseWrap: 'never',
  endOfLine: 'auto',
  overrides: [
    {
      files: '.prettierrc',
      options: {
        parser: 'json',
      },
    },
  ],
  plugins: ['prettier-plugin-tailwindcss'],
}
export default config
