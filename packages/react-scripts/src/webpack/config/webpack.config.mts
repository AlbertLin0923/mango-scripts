import path from 'path'

import fs from 'fs-extra'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'

import { getModules } from './getModules.mjs'
import { getPlugins } from './getPlugins.mjs'
import { getModuleRules } from './getModuleRules.mjs'
import { getOptimization } from './getOptimization.mjs'

import ModuleScopePlugin from '../../common/utils/ModuleScopePlugin.mjs'
import { getEnv } from '../../common/getEnv.mjs'
import { getHash } from '../../common/utils/index.mjs'

import type { PathsType } from '../../common/getPaths.mjs'
import type { UserConfigType } from '../../defineConfig.mjs'
import type { Configuration } from 'webpack'

// This is the production and development configuration.
// It is focused on developer experience, fast rebuilds, and a minimal bundle.
export const getWebpackConfig = (
  userConfig: UserConfigType,
  paths: PathsType,
): Configuration => {
  const isEnvDevelopment = process.env.NODE_ENV === 'development'
  const isEnvProduction = process.env.NODE_ENV === 'production'
  // Source maps are resource heavy and can cause out of memory issue for large source files.
  const useSourceMap = process.env.USE_SOURCEMAP === 'true'
  // Variable used for enabling profiling in Production
  // passed into alias object. Uses a flag if passed into the build command
  const useProfile = process.env.USE_PROFILE === 'true'

  const modules = getModules(paths)

  // We will provide `paths.publicUrlOrPath` to our app
  // as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
  // Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
  // Get environment variables to inject into our app.
  const env = getEnv(paths.publicUrlOrPath.slice(0, -1))

  return {
    target: ['browserslist'],
    // Webpack noise constrained to errors and warnings
    stats: 'errors-warnings',
    mode: isEnvProduction
      ? 'production'
      : isEnvDevelopment
        ? 'development'
        : undefined,
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
        ? 'static/js/[name].[contenthash:16].js'
        : isEnvDevelopment
          ? 'static/js/bundle.js'
          : undefined,
      // There are also additional JS chunk files if you use code splitting.
      chunkFilename: isEnvProduction
        ? 'static/js/[name].[contenthash:16].chunk.js'
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
        ? (info: any) =>
            path
              .relative(paths.appSrc, info.absoluteResourcePath)
              .replace(/\\/g, '/')
        : isEnvDevelopment
          ? (info: any) =>
              path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')
          : undefined,
    },
    cache: {
      type: 'filesystem',
      version: getHash(env.raw),
      cacheDirectory: paths.appWebpackCache,
      store: 'pack',
      buildDependencies: {
        defaultWebpack: ['webpack/lib/'],
        config: [__filename],
        tsconfig: [paths.appTsConfig, paths.appJsConfig].filter((f) =>
          fs.pathExistsSync(f),
        ),
      },
    },
    infrastructureLogging: {
      level: 'none',
    },
    optimization: getOptimization(userConfig),
    resolve: {
      // This allows you to set a fallback for where webpack should look for modules.
      // We placed these paths second because we want `node_modules` to "win"
      // if there are any conflicts. This matches Node resolution mechanism.
      // https://github.com/facebook/create-react-app/issues/253
      modules: ['node_modules', paths.appNodeModules].concat(
        modules.additionalModulePaths || [],
      ),
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
              'scheduler/tracing': 'scheduler/tracing-profiling',
            }
          : {}),
        ...modules.webpackAliases,
      },
      plugins: [
        // Prevents users from importing files from outside of src/ (or node_modules/).
        // This often causes confusion because we only process files within src/ with babel.
        // To fix this, we prevent you from importing files out of src/ -- if you'd like to,
        // please link the files into your node_modules/ and let module-resolution kick in.
        // Make sure your source files are compiled, as they will not be processed in any way.
        new ModuleScopePlugin(paths.appSrc, [
          paths.appPackageJson,
          require.resolve('react-refresh/runtime'),
          require.resolve('@pmmmwh/react-refresh-webpack-plugin'),
          require.resolve('@mango-scripts/babel-preset-mango/source'),
          require.resolve('@babel/runtime/helpers/esm/assertThisInitialized', {
            paths: [
              require.resolve('@mango-scripts/babel-preset-mango/source'),
            ],
          }),
          require.resolve('@babel/runtime/regenerator', {
            paths: [
              require.resolve('@mango-scripts/babel-preset-mango/source'),
            ],
          }),
        ]),
        // Using this plugin means that you should no longer need to add alias entries in your webpack.config.js
        // which correspond to the paths entries in your tsconfig.json.
        // This plugin creates those alias entries for you, so you don't have to
        new TsconfigPathsPlugin(),
      ],
    },
    module: {
      parser: { javascript: { strictExportPresence: true } },
      rules: getModuleRules(userConfig, paths),
    },
    plugins: getPlugins(userConfig, paths),
    // Turn off performance processing because we utilize
    // our own hints via the FileSizeReporter
    performance: false,
  }
}
