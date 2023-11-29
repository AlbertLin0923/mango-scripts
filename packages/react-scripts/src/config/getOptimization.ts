import TerserPlugin from 'terser-webpack-plugin'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'

import { getUserConfig, deepMergeWithArray } from './getUserConfig'

import type { MinifyOptions } from 'terser'

const getJsMinimizer = (): TerserPlugin<MinifyOptions> => {
  const useProfile = process.env.USE_PROFILE === 'true'

  const { minify, terserOptions } = getUserConfig(
    'optimization.minimizer.jsMinimizer',
  )

  switch (minify) {
    case 'uglifyJsMinify':
      return new TerserPlugin({
        minify: TerserPlugin.uglifyJsMinify,
        terserOptions,
      })
    case 'esbuildMinify':
      return new TerserPlugin({
        minify: TerserPlugin.esbuildMinify,
        terserOptions,
      })
    case 'swcMinify':
      return new TerserPlugin({
        minify: TerserPlugin.swcMinify,
        terserOptions,
      })
    default:
      return new TerserPlugin({
        minify: TerserPlugin.terserMinify,
        terserOptions: deepMergeWithArray(terserOptions, {
          parse: {
            // We want terser to parse ecma 8 code. However, we don't want it
            // to apply any minification steps that turns valid ecma 5 code
            // into invalid ecma 5 code. This is why the 'compress' and 'output'
            // sections only apply transformations that are ecma 5 safe
            // https://github.com/facebook/create-react-app/pull/4234
            ecma: 2020,
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
          },
          mangle: {
            safari10: true,
          },
          // Added for profiling in devtools
          keep_classnames: useProfile,
          keep_fnames: useProfile,
          output: {
            ecma: 5,
            comments: false,
            // Turned on because emoji and regex is not minified properly using default
            // https://github.com/facebook/create-react-app/issues/2488
            ascii_only: true,
          },
        }),
      })
  }
}

const getCssMinimizer = () => {
  const { minify, minimizerOptions } = getUserConfig(
    'optimization.minimizer.cssMinimizer',
  )

  switch (minify) {
    case 'cssoMinify':
      return new CssMinimizerPlugin({
        minify: CssMinimizerPlugin.cssoMinify,
        minimizerOptions,
      })
    case 'cleanCssMinify':
      return new CssMinimizerPlugin({
        minify: CssMinimizerPlugin.cleanCssMinify,
        minimizerOptions,
      })
    case 'esbuildMinify':
      return new CssMinimizerPlugin({
        minify: CssMinimizerPlugin.esbuildMinify,
        minimizerOptions,
      })
    case 'lightningCssMinify':
      return new CssMinimizerPlugin({
        minify: CssMinimizerPlugin.lightningCssMinify,
        minimizerOptions,
      })
    case 'swcMinify':
      return new CssMinimizerPlugin({
        minify: CssMinimizerPlugin.swcMinify,
        minimizerOptions,
      })
    default:
      return new CssMinimizerPlugin({
        minify: CssMinimizerPlugin.cssnanoMinify,
        minimizerOptions: deepMergeWithArray(minimizerOptions, {
          preset: 'default',
        }),
      })
  }
}

const defaultSplitChunks = {
  chunks: 'all',
  cacheGroups: {
    libs: {
      name: 'chunk-libs',
      test: /[\\/]node_modules[\\/]/,
      priority: 10,
      chunks: 'initial', // only package third parties that are initially dependent
    },
    antd: {
      name: 'chunk-antd', // split elementUI into a single package
      priority: 12, // the weight needs to be larger than libs and app or it will be packaged into libs or app
      test: /[\\/]node_modules[\\/]_?antd(.*)/, // in order to adapt to cnpm
    },
    elementUI: {
      name: 'chunk-elementUI', // split elementUI into a single package
      priority: 22, // the weight needs to be larger than libs and app or it will be packaged into libs or app
      test: /[\\/]node_modules[\\/]_?element-ui(.*)/, // in order to adapt to cnpm
    },
    d3: {
      name: 'chunk-d3', // split d3 into a single package
      priority: 22, // the weight needs to be larger than libs and app or it will be packaged into libs or app
      test: /[\\/]node_modules[\\/]d3/, // in order to adapt to cnpm
    },
    echarts: {
      name: 'chunk-echarts', // split echarts into a single package
      priority: 22, // the weight needs to be larger than libs and app or it will be packaged into libs or app
      test: /[\\/]node_modules[\\/]echarts/, // in order to adapt to cnpm
    },
    exceljs: {
      name: 'chunk-exceljs', // split exceljs into a single package
      priority: 22, // the weight needs to be larger than libs and app or it will be packaged into libs or app
      test: /[\\/]node_modules[\\/]exceljs/, // in order to adapt to cnpm
    },
    xlsx: {
      name: 'chunk-xlsx', // split xlsx into a single package
      priority: 22, // the weight needs to be larger than libs and app or it will be packaged into libs or app
      test: /[\\/]node_modules[\\/]xlsx/, // in order to adapt to cnpm
    },
  },
}

export const getOptimization = () => {
  const isEnvDevelopment = process.env.NODE_ENV === 'development'
  const isEnvProduction = process.env.NODE_ENV === 'production'

  const splitChunks = getUserConfig('optimization.splitChunks')

  return {
    minimize: isEnvProduction,
    splitChunks:
      isEnvProduction && deepMergeWithArray(splitChunks, defaultSplitChunks),
    minimizer: [
      // This is only used in production mode
      getJsMinimizer(),
      getCssMinimizer(),
    ],
  }
}
