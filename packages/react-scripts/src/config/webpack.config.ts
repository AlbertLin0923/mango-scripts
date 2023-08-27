import fs from 'fs-extra'
import path from 'path'
import webpack from 'webpack'
import resolve from 'resolve'

import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { WebpackManifestPlugin } from 'webpack-manifest-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import WorkboxWebpackPlugin from 'workbox-webpack-plugin'
import ESLintPlugin from 'eslint-webpack-plugin'
import StylelintPlugin from 'stylelint-webpack-plugin'
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin'
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin'

import InterpolateHtmlPlugin from 'react-dev-utils/InterpolateHtmlPlugin'
import InlineChunkHtmlPlugin from 'react-dev-utils/InlineChunkHtmlPlugin'
import ForkTsCheckerWebpackPlugin from 'react-dev-utils/ForkTsCheckerWebpackPlugin'
import ModuleNotFoundPlugin from 'react-dev-utils/ModuleNotFoundPlugin'
import ModuleScopePlugin from 'react-dev-utils/ModuleScopePlugin'

import getPaths from './getPaths'
import getModules from './getModules'
import { getClientEnvironment } from './getEnv'
import { getHash } from '../utils'
import { getJsMinimizer, getCssMinimizer } from './getMinimizerConfig'
import { getModuleRules } from './getModuleRules'
import { getUserConfig, deepMergeWithArray } from './getUserConfig'
import type { Configuration } from 'webpack'

// This is the production and development configuration.
// It is focused on developer experience, fast rebuilds, and a minimal bundle.
const getOriginWebpackConfig = (mfsu?: any): Configuration => {
  const isEnvDevelopment = process.env.NODE_ENV === 'development'
  const isEnvProduction = process.env.NODE_ENV === 'production'
  // Source maps are resource heavy and can cause out of memory issue for large source files.
  const useSourceMap = process.env.USE_SOURCEMAP === 'true'
  const useBundleAnalyzerPlugin = process.env.USE_ANALYZE === 'true'
  // Variable used for enabling profiling in Production
  // passed into alias object. Uses a flag if passed into the build command
  const useProfile = process.env.USE_PROFILE === 'true'

  const paths = getPaths()
  const modules = getModules()
  const { splitChunks } = getUserConfig('optimization.splitChunks')
  const {
    plugins: { eslint, stylelint, typescript }
  } = getUserConfig('plugins')

  // We will provide `paths.publicUrlOrPath` to our app
  // as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
  // Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
  // Get environment variables to inject into our app.
  const env = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1))

  const reactRefreshRuntimeEntry = require.resolve('react-refresh/runtime')
  const reactRefreshWebpackPluginRuntimeEntry = require.resolve(
    '@pmmmwh/react-refresh-webpack-plugin'
  )
  const babelRuntimeEntry = require.resolve('babel-preset-react-app')
  const babelRuntimeEntryHelpers = require.resolve(
    '@babel/runtime/helpers/esm/assertThisInitialized',
    { paths: [babelRuntimeEntry] }
  )
  const babelRuntimeRegenerator = require.resolve('@babel/runtime/regenerator', {
    paths: [babelRuntimeEntry]
  })

  return {
    target: ['browserslist'],
    // Webpack noise constrained to errors and warnings
    stats: 'errors-warnings',
    mode: isEnvProduction ? 'production' : isEnvDevelopment ? 'development' : undefined,
    // Stop compilation early in production
    bail: isEnvProduction,
    devtool: isEnvProduction
      ? useSourceMap
        ? 'source-map'
        : false
      : isEnvDevelopment && 'cheap-module-source-map',
    // These are the "entry points" to our application.
    // This means they will be the "root" imports that are included in JS bundle.
    entry: paths.appIndexJs,
    output: {
      // The dist folder.
      path: paths.appDist,
      // Add /* filename */ comments to generated require()s in the output.
      pathinfo: isEnvDevelopment,
      // There will be one main bundle, and one file per asynchronous chunk.
      // In development, it does not produce real files.
      filename: isEnvProduction
        ? 'static/js/[name].[contenthash:12].js'
        : isEnvDevelopment
        ? 'static/js/bundle.js'
        : undefined,
      // There are also additional JS chunk files if you use code splitting.
      chunkFilename: isEnvProduction
        ? 'static/js/[name].[contenthash:12].chunk.js'
        : isEnvDevelopment
        ? 'static/js/[name].chunk.js'
        : undefined,
      assetModuleFilename: 'static/media/[name].[hash][ext]',
      // webpack uses `publicPath` to determine where the app is being served from.
      // It requires a trailing slash, or the file assets will get an incorrect path.
      // We inferred the "public path" (such as / or /my-project) from homepage.
      publicPath: paths.publicUrlOrPath,
      // Point sourcemap entries to original disk location (format as URL on Windows)
      devtoolModuleFilenameTemplate: isEnvProduction
        ? (info: any) => path.relative(paths.appSrc, info.absoluteResourcePath).replace(/\\/g, '/')
        : isEnvDevelopment
        ? (info: any) => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')
        : undefined
    },
    cache: {
      type: 'filesystem',
      version: getHash(env.raw),
      cacheDirectory: paths.appWebpackCache,
      store: 'pack',
      buildDependencies: {
        defaultWebpack: ['webpack/lib/'],
        config: [__filename],
        tsconfig: [paths.appTsConfig, paths.appJsConfig].filter((f) => fs.existsSync(f))
      }
    },
    infrastructureLogging: {
      level: 'none'
    },
    optimization: {
      minimize: isEnvProduction,
      splitChunks:
        isEnvProduction &&
        deepMergeWithArray(splitChunks, {
          chunks: 'all',
          cacheGroups: {
            libs: {
              name: 'chunk-libs',
              test: /[\\/]node_modules[\\/]/,
              priority: 10,
              chunks: 'initial' // only package third parties that are initially dependent
            },
            antd: {
              name: 'chunk-antd', // split elementUI into a single package
              priority: 19, // the weight needs to be larger than libs and app or it will be packaged into libs or app
              test: /[\\/]node_modules[\\/]_?antd(.*)/ // in order to adapt to cnpm
            },
            elementUI: {
              name: 'chunk-elementUI', // split elementUI into a single package
              priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
              test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
            },
            d3: {
              name: 'chunk-d3', // split d3 into a single package
              priority: 21, // the weight needs to be larger than libs and app or it will be packaged into libs or app
              test: /[\\/]node_modules[\\/]d3/ // in order to adapt to cnpm
            },
            echarts: {
              name: 'chunk-echarts', // split echarts into a single package
              priority: 22, // the weight needs to be larger than libs and app or it will be packaged into libs or app
              test: /[\\/]node_modules[\\/]echarts/ // in order to adapt to cnpm
            },
            exceljs: {
              name: 'chunk-exceljs', // split exceljs into a single package
              priority: 22, // the weight needs to be larger than libs and app or it will be packaged into libs or app
              test: /[\\/]node_modules[\\/]exceljs/ // in order to adapt to cnpm
            },
            xlsx: {
              name: 'chunk-xlsx', // split xlsx into a single package
              priority: 22, // the weight needs to be larger than libs and app or it will be packaged into libs or app
              test: /[\\/]node_modules[\\/]xlsx/ // in order to adapt to cnpm
            }
          }
        }),
      minimizer: [
        // This is only used in production mode
        getJsMinimizer(),
        getCssMinimizer()
      ]
    },
    resolve: {
      // This allows you to set a fallback for where webpack should look for modules.
      // We placed these paths second because we want `node_modules` to "win"
      // if there are any conflicts. This matches Node resolution mechanism.
      // https://github.com/facebook/create-react-app/issues/253
      modules: ['node_modules', paths.appNodeModules].concat(modules.additionalModulePaths || []),
      // These are the reasonable defaults supported by the Node ecosystem.
      // We also include JSX as a common component filename extension to support
      // some tools, although we do not recommend using it, see:
      // https://github.com/facebook/create-react-app/issues/290
      // `web` extension prefixes have been added for better support
      // for React Native Web.
      extensions: paths.moduleFileExtensions.map((ext) => `.${ext}`),
      alias: {
        '@': paths.appSrc,
        // Allows for better profiling with ReactDevTools
        ...(isEnvProduction && useProfile
          ? {
              'react-dom$': 'react-dom/profiling',
              'scheduler/tracing': 'scheduler/tracing-profiling'
            }
          : {}),
        ...modules.webpackAliases
      },
      plugins: [
        // Prevents users from importing files from outside of src/ (or node_modules/).
        // This often causes confusion because we only process files within src/ with babel.
        // To fix this, we prevent you from importing files out of src/ -- if you'd like to,
        // please link the files into your node_modules/ and let module-resolution kick in.
        // Make sure your source files are compiled, as they will not be processed in any way.
        new ModuleScopePlugin(paths.appSrc, [
          paths.appPackageJson,
          reactRefreshRuntimeEntry,
          reactRefreshWebpackPluginRuntimeEntry,
          babelRuntimeEntry,
          babelRuntimeEntryHelpers,
          babelRuntimeRegenerator
        ]) as any
      ]
    },
    module: {
      parser: { javascript: { strictExportPresence: true } },
      rules: getModuleRules()
    },
    plugins: [
      // Generates an `index.html` file with the <script> injected.
      new HtmlWebpackPlugin(
        Object.assign(
          {},
          {
            inject: true,
            template: paths.appHtml
          },
          isEnvProduction
            ? {
                minify: {
                  removeComments: true,
                  collapseWhitespace: true,
                  removeRedundantAttributes: true,
                  useShortDoctype: true,
                  removeEmptyAttributes: true,
                  removeStyleLinkTypeAttributes: true,
                  keepClosingSlash: true,
                  minifyJS: true,
                  minifyCSS: true,
                  minifyURLs: true
                }
              }
            : undefined
        )
      ),
      // Inlines the webpack runtime script. This script is too small to warrant
      // a network request.
      // https://github.com/facebook/create-react-app/issues/5358
      isEnvProduction && new InlineChunkHtmlPlugin(HtmlWebpackPlugin as any, [/runtime-.+[.]js/]),
      // Makes some environment variables available in index.html.
      // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
      // <link rel="icon" href="%PUBLIC_URL%/favicon.ico">
      // It will be an empty string unless you specify "homepage"
      // in `package.json`, in which case it will be the pathname of that URL.
      new InterpolateHtmlPlugin(HtmlWebpackPlugin as any, env.raw),
      // This gives some necessary context to module not found errors, such as
      // the requesting resource.
      new ModuleNotFoundPlugin(paths.appPath),
      // Makes some environment variables available to the JS code, for example:
      // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
      // It is absolutely essential that NODE_ENV is set to production
      // during a production build.
      // Otherwise React will be compiled in the very slow development mode.
      new webpack.DefinePlugin(env.stringified),
      // Experimental hot reloading for React .
      // https://github.com/facebook/react/tree/main/packages/react-refresh
      isEnvDevelopment &&
        new ReactRefreshWebpackPlugin({
          overlay: false
        }),
      // Watcher doesn't work well if you mistype casing in a path so we use
      // a plugin that prints an error when you attempt to do this.
      // See https://github.com/facebook/create-react-app/issues/240
      isEnvDevelopment && new CaseSensitivePathsPlugin(),
      isEnvProduction &&
        new MiniCssExtractPlugin({
          // Options similar to the same options in webpackOptions.output
          // both options are optional
          filename: 'static/css/[name].[contenthash:12].css',
          chunkFilename: 'static/css/[name].[contenthash:12].chunk.css'
        }),
      // Generate an asset manifest file with the following content:
      // - "files" key: Mapping of all asset filenames to their corresponding
      //   output file so that tools can pick it up without having to parse
      //   `index.html`
      // - "entrypoints" key: Array of files which are included in `index.html`,
      //   can be used to reconstruct the HTML if necessary

      // Note: Not use `MFSU` with `WebpackManifestPlugin` in dev scene
      (!mfsu || isEnvProduction) &&
        new WebpackManifestPlugin({
          fileName: 'asset-manifest.json',
          publicPath: paths.publicUrlOrPath,
          generate: (seed, files, entrypoints) => {
            const manifestFiles = files.reduce((manifest, file) => {
              manifest[file.name] = file.path
              return manifest
            }, seed)
            const entrypointFiles = entrypoints.main.filter(
              (fileName) => !fileName.endsWith('.map')
            )

            return {
              files: manifestFiles,
              entrypoints: entrypointFiles
            }
          }
        }),
      // Generate a service worker script that will precache, and keep up to date,
      // the HTML & assets that are part of the webpack build.
      isEnvProduction &&
        fs.existsSync(paths.swSrc) &&
        new WorkboxWebpackPlugin.InjectManifest({
          swSrc: paths.swSrc,
          dontCacheBustURLsMatching: /\.[0-9a-f]{8}\./,
          exclude: [/\.map$/, /asset-manifest\.json$/, /LICENSE/],
          // Bump up the default maximum size (2mb) that's precached,
          // to make lazy-loading failure scenarios less likely.
          // See https://github.com/cra-template/pwa/issues/13#issuecomment-722667270
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
        }),
      // TypeScript type checking
      typescript?.enable &&
        new ForkTsCheckerWebpackPlugin(
          deepMergeWithArray(typescript?.options, {
            async: isEnvDevelopment,
            typescript: {
              typescriptPath: resolve.sync('typescript', {
                basedir: paths.appNodeModules
              }),
              configOverwrite: {
                compilerOptions: {
                  sourceMap: isEnvProduction ? useSourceMap : isEnvDevelopment,
                  skipLibCheck: true,
                  inlineSourceMap: false,
                  declarationMap: false,
                  noEmit: true,
                  incremental: true,
                  tsBuildInfoFile: paths.appTsBuildInfoFile
                }
              },
              context: paths.appPath,
              diagnosticOptions: {
                syntactic: true
              },
              mode: 'write-references'
              // profile: true,
            },
            issue: {
              // This one is specifically to match during CI tests,
              // as micromatch doesn't match
              // '../cra-template-typescript/template/src/App.tsx'
              // otherwise.
              include: [{ file: '../**/src/**/*.{ts,tsx}' }, { file: '**/src/**/*.{ts,tsx}' }],
              exclude: [
                { file: '**/src/**/__tests__/**' },
                { file: '**/src/**/?(*.){spec|test}.*' },
                { file: '**/src/setupProxy.*' },
                { file: '**/src/setupTests.*' }
              ]
            },
            logger: {
              infrastructure: 'silent'
            }
          })
        ),
      eslint?.enable &&
        new ESLintPlugin(
          deepMergeWithArray(eslint?.options, {
            extensions: ['js', 'mjs', 'jsx', 'ts', 'tsx'],
            formatter: require.resolve('react-dev-utils/eslintFormatter'),
            eslintPath: require.resolve('eslint'),
            failOnError: isEnvProduction,
            context: paths.appSrc,
            cache: true,
            cacheLocation: path.resolve(paths.appNodeModules, '.cache/.eslintcache'),
            cwd: paths.appPath
          })
        ),
      stylelint?.enable &&
        new StylelintPlugin(
          deepMergeWithArray(stylelint?.options, {
            extensions: ['less', 'scss', 'sass', 'stylus', 'styl', 'css'],
            stylelintPath: require.resolve('stylelint'),
            failOnError: isEnvProduction,
            context: paths.appSrc,
            cache: true,
            cacheLocation: path.resolve(paths.appNodeModules, '.cache/.stylelintcache'),
            cwd: paths.appPath
          })
        ),
      useBundleAnalyzerPlugin && new BundleAnalyzerPlugin(),
      new webpack.ProgressPlugin({
        handler: (percentage, message, ...args) => {
          // e.g. Output each progress message directly to the console:
          console.info(percentage, message, ...args)
        }
      })
    ].filter(Boolean),
    // Turn off performance processing because we utilize
    // our own hints via the FileSizeReporter
    performance: false
  }
}

export const getDevConfig = async (mfsu?: any) => {
  if (mfsu) {
    const config = getOriginWebpackConfig(mfsu)
    await mfsu.setWebpackConfig({
      config
    })
    return config
  } else {
    return getOriginWebpackConfig(mfsu)
  }
}

export const getBuildConfig = () => {
  return getOriginWebpackConfig()
}
