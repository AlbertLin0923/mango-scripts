import TerserPlugin from 'terser-webpack-plugin'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'

import { mergeTerserOptionsConfig } from './getUserConfig'

export const getJsMinimizer = () => {
  const useProfile = process.env.USE_PROFILE === 'true'
  const dropConsole = process.env.DROP_CONSOLE === 'true'
  const dropDebugger = process.env.DROP_DEBUGGER === 'true'

  switch (process.env.USE_JS_MINIMIZER) {
    case 'uglifyJsMinify':
      return new TerserPlugin({
        minify: TerserPlugin.uglifyJsMinify,
        terserOptions: mergeTerserOptionsConfig({
          // `uglif-js` options
        })
      })
    case 'esbuildMinify':
      return new TerserPlugin({
        minify: TerserPlugin.esbuildMinify,
        terserOptions: mergeTerserOptionsConfig({
          // `esbuild` options
        })
      })
    case 'swcMinify':
      return new TerserPlugin({
        minify: TerserPlugin.swcMinify,
        terserOptions: mergeTerserOptionsConfig({
          // `swc` options
        })
      })
    default:
      return new TerserPlugin({
        minify: TerserPlugin.terserMinify,
        terserOptions: mergeTerserOptionsConfig({
          parse: {
            // We want terser to parse ecma 8 code. However, we don't want it
            // to apply any minification steps that turns valid ecma 5 code
            // into invalid ecma 5 code. This is why the 'compress' and 'output'
            // sections only apply transformations that are ecma 5 safe
            // https://github.com/facebook/create-react-app/pull/4234
            ecma: 2020
          },
          compress: {
            ecma: 5,
            // Disabled because of an issue with Uglify breaking seemingly valid code:
            // https://github.com/facebook/create-react-app/issues/2376
            // Pending further investigation:
            // https://github.com/mishoo/UglifyJS2/issues/2011
            comparisons: false,
            // Disabled because of an issue with Terser breaking valid code:
            // https://github.com/facebook/create-react-app/issues/5250
            // Pending further investigation:
            // https://github.com/terser-js/terser/issues/120
            inline: 2,
            drop_console: dropConsole,
            drop_debugger: dropDebugger
          },
          mangle: {
            safari10: true
          },
          // Added for profiling in devtools
          keep_classnames: useProfile,
          keep_fnames: useProfile,
          output: {
            ecma: 5,
            comments: false,
            // Turned on because emoji and regex is not minified properly using default
            // https://github.com/facebook/create-react-app/issues/2488
            ascii_only: true
          }
        })
      })
  }
}

export const getCssMinimizer = () => {
  switch (process.env.USE_CSS_MINIMIZER) {
    case 'esbuildMinify':
      return new CssMinimizerPlugin({
        minify: CssMinimizerPlugin.esbuildMinify
      })
    case 'swcMinify':
      return new CssMinimizerPlugin({
        minify: CssMinimizerPlugin.swcMinify
      })
    case 'lightningCssMinify':
      return new CssMinimizerPlugin({
        minify: CssMinimizerPlugin.lightningCssMinify
      })
    default:
      return new CssMinimizerPlugin()
  }
}
