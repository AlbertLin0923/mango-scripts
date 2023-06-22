import TerserPlugin from 'terser-webpack-plugin'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'

import type { JsMinifyOptions as SwcOptions } from '@swc/core'
import type { MinifyOptions as UglifyJSOptions } from 'uglify-js'
import type { TransformOptions as EsbuildOptions } from 'esbuild'
import type { MinifyOptions as TerserOptions } from 'terser'

export const getJsMini = () => {
  const useEsbuid = process.env.USE_ESBUILD === 'true'
  const useSwc = process.env.USE_SWC === 'true'
  const useUglify = process.env.USE_UGLIFY === 'true'
  const useProfile = process.env.USE_PROFILE === 'true'

  if (useSwc) {
    return new TerserPlugin<SwcOptions>({
      minify: TerserPlugin.swcMinify,
      terserOptions: {
        // `swc` options
      }
    })
  }

  if (useUglify) {
    return new TerserPlugin<UglifyJSOptions>({
      minify: TerserPlugin.uglifyJsMinify,
      terserOptions: {
        // `uglif-js` options
      }
    })
  }

  if (useEsbuid) {
    return new TerserPlugin<EsbuildOptions>({
      minify: TerserPlugin.esbuildMinify,
      terserOptions: {
        // `esbuild` options
      }
    })
  }

  // Alternative usage:
  return new TerserPlugin<TerserOptions>({
    minify: TerserPlugin.terserMinify,
    terserOptions: {
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
        inline: 2
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
    }
  })
}

export const getCssMini = () => {
  return new CssMinimizerPlugin()
}
