import path from 'node:path'

import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import loaderUtils from 'loader-utils'
import browserslistToEsbuild from 'browserslist-to-esbuild'

import { deepMergeWithArray } from './getUserConfig.mjs'

import { extractPkgJson } from '../../common/utils/index.mjs'
import { require } from '../../common/utils/index.mjs'

import type { UserConfigType } from '../../defineConfig.mjs'
import type { PathsType } from '../../common/getPaths.mjs'
import type { Options as SwcOptions } from '@swc/core'
import type { TransformOptions as EsbuildOptions } from 'esbuild'
import type { RuleSetRule } from 'webpack'

const cssRegex = /\.css$/
const cssModuleRegex = /\.module\.css$/
const sassRegex = /\.(scss|sass)$/
const sassModuleRegex = /\.module\.(scss|sass)$/
const lessRegex = /\.less$/
const lessModuleRegex = /\.module\.less$/
const stylusRegex = /\.(styl|stylus)$/
const stylusModuleRegex = /\.module\.(styl|stylus)$/

const getLocalIdent = (
  context: any,
  localIdentName: string,
  localName: string,
  options: any,
) => {
  // Use the filename or folder name, based on some uses the index.js / index.module.(css|scss|sass) project style
  const fileNameOrFolder = context.resourcePath.match(
    /index\.module\.(css|scss|sass)$/,
  )
    ? '[folder]'
    : '[name]'
  // Create a hash based on a the file location and class name. Will be unique across a project, and close to globally unique.
  const hash = loaderUtils.getHashDigest(
    (path.posix.relative(context.rootContext, context.resourcePath) +
      localName) as any,
    'md5',
    'base64',
    5,
  )
  // Use loaderUtils to find the file or folder name
  const className = loaderUtils.interpolateName(
    context,
    fileNameOrFolder + '_' + localName + '__' + hash,
    options,
  )
  // Remove the .module that appears in every classname when based on the file and replace all "." with "_".
  return className.replace('.module_', '_').replace(/\./g, '_')
}

// common function to get style loaders
const transformStyleLoaders = (
  userConfig: UserConfigType,
  paths: PathsType,
  cssOptions: any,
  preProcessor?: any,
  preProcessorOptions?: any,
) => {
  const isEnvDevelopment = process.env.NODE_ENV === 'development'
  const isEnvProduction = process.env.NODE_ENV === 'production'
  const useSourceMap = process.env.USE_SOURCEMAP === 'true'

  const {
    loader: { less, sass, stylus, postcss },
  } = userConfig

  const preProcessorLoaderMap: any = {
    'less-loader': less,
    'sass-loader': sass,
    'stylus-loader': stylus,
  }

  return [
    isEnvDevelopment && require.resolve('style-loader'),
    isEnvProduction && {
      loader: MiniCssExtractPlugin.loader,
      // css is located in `static/css`, use '../../' to locate index.html folder
      // in production `paths.publicUrlOrPath` can be a relative path
      options: paths.publicUrlOrPath.startsWith('.')
        ? { publicPath: '../../' }
        : {},
    },
    {
      loader: require.resolve('css-loader'),
      options: cssOptions,
    },
    {
      // Options for PostCSS as we reference these options twice
      // Adds vendor prefixing based on your specified browser support in
      // package.json
      loader: require.resolve('postcss-loader'),
      options: deepMergeWithArray(postcss['options'], {
        postcssOptions: {
          // Necessary for external CSS imports to work
          // https://github.com/facebook/create-react-app/issues/2677
          ident: 'postcss',
          config: false,
          plugins: [
            'postcss-flexbugs-fixes',
            [
              'postcss-preset-env',
              {
                autoprefixer: {
                  flexbox: 'no-2009',
                },
                stage: 3,
              },
            ],
            // Adds PostCSS Normalize as the reset css with default options,
            // so that it honors browserslist config in package.json
            // which in turn let's users customize the target behavior as per their needs.
            'postcss-normalize',
          ],
        },
        sourceMap: isEnvProduction ? useSourceMap : isEnvDevelopment,
      }),
    },
    preProcessor && {
      loader: require.resolve('resolve-url-loader'),
      options: {
        sourceMap: isEnvProduction ? useSourceMap : isEnvDevelopment,
        root: paths.appSrc,
      },
    },
    preProcessor && {
      loader: require.resolve(preProcessor),
      options: deepMergeWithArray(
        preProcessorLoaderMap[preProcessor]['options'],
        {
          sourceMap: true,
          ...preProcessorOptions,
        },
      ),
    },
  ].filter(Boolean)
}

const getSvgLoaders = (userConfig: UserConfigType, paths: PathsType) => {
  return [
    {
      test: /\.svg$/,
      include: [paths.svgSpritePath],
      use: [
        {
          loader: require.resolve('svg-sprite-loader'),
          options: {
            symbolId: 'icon-[name]',
          },
        },
        { loader: require.resolve('svgo-loader') },
      ],
    },
    {
      test: /\.svg$/,
      exclude: [paths.svgSpritePath],
      use: [
        {
          loader: require.resolve('@svgr/webpack'),
          options: {
            prettier: false,
            svgo: false,
            svgoConfig: {
              plugins: [{ removeViewBox: false }],
            },
            titleProp: true,
            ref: true,
          },
        },
        {
          loader: require.resolve('file-loader'),
          options: {
            name: 'static/media/[name].[hash].[ext]',
          },
        },
      ],
      issuer: {
        and: [/\.(ts|tsx|js|jsx|md|mdx)$/],
      },
    },
  ]
}

const getStyleLoaders = (userConfig: UserConfigType, paths: PathsType) => {
  const isEnvDevelopment = process.env.NODE_ENV === 'development'
  const isEnvProduction = process.env.NODE_ENV === 'production'
  const useSourceMap = process.env.USE_SOURCEMAP === 'true'

  const {
    loader: { less, sass, stylus },
  } = userConfig

  const cssRule = [
    {
      test: cssRegex,
      exclude: cssModuleRegex,
      use: transformStyleLoaders(userConfig, paths, {
        importLoaders: 1,
        sourceMap: isEnvProduction ? useSourceMap : isEnvDevelopment,
        modules: {
          mode: 'icss',
        },
      }),
      // Don't consider CSS imports dead code even if the
      // containing package claims to have no side effects.
      // Remove this when webpack adds a warning or an error for this.
      // See https://github.com/webpack/webpack/issues/6571
      sideEffects: true,
    },
    {
      test: cssModuleRegex,
      use: transformStyleLoaders(userConfig, paths, {
        importLoaders: 1,
        sourceMap: isEnvProduction ? useSourceMap : isEnvDevelopment,
        modules: {
          mode: 'local',
          getLocalIdent: getLocalIdent,
        },
      }),
    },
  ]

  const sassRule = sass.enable
    ? [
        {
          test: sassRegex,
          exclude: sassModuleRegex,
          use: transformStyleLoaders(
            userConfig,
            paths,
            {
              importLoaders: 3,
              sourceMap: isEnvProduction ? useSourceMap : isEnvDevelopment,
              modules: {
                mode: 'icss',
              },
            },
            'sass-loader',
          ),
          // Don't consider CSS imports dead code even if the
          // containing package claims to have no side effects.
          // Remove this when webpack adds a warning or an error for this.
          // See https://github.com/webpack/webpack/issues/6571
          sideEffects: true,
        },
        {
          test: sassModuleRegex,
          use: transformStyleLoaders(
            userConfig,
            paths,
            {
              importLoaders: 3,
              sourceMap: isEnvProduction ? useSourceMap : isEnvDevelopment,
              modules: {
                mode: 'local',
                getLocalIdent: getLocalIdent,
              },
            },
            'sass-loader',
          ),
        },
      ]
    : []

  const lessRule = less.enable
    ? [
        {
          test: lessRegex,
          exclude: lessModuleRegex,
          use: transformStyleLoaders(
            userConfig,
            paths,
            {
              importLoaders: 4,
              sourceMap: isEnvProduction ? useSourceMap : isEnvDevelopment,
              modules: {
                mode: 'icss',
              },
            },
            'less-loader',
            {
              lessOptions: {
                modifyVars: {},
                javascriptEnabled: true,
              },
            },
          ),
          sideEffects: true,
        },
        {
          test: lessModuleRegex,
          use: transformStyleLoaders(
            userConfig,
            paths,
            {
              importLoaders: 4,
              sourceMap: isEnvProduction ? useSourceMap : isEnvDevelopment,
              modules: {
                mode: 'local',
                getLocalIdent: getLocalIdent,
              },
            },
            'less-loader',
            {
              lessOptions: {
                modifyVars: {},
                javascriptEnabled: true,
              },
            },
          ),
        },
      ]
    : []

  const stylusRule = stylus.enable
    ? [
        {
          test: stylusRegex,
          exclude: stylusModuleRegex,
          use: transformStyleLoaders(
            userConfig,
            paths,
            {
              importLoaders: 5,
              sourceMap: isEnvProduction ? useSourceMap : isEnvDevelopment,
              modules: {
                mode: 'icss',
              },
            },
            'stylus-loader',
          ),
          sideEffects: true,
        },
        {
          test: stylusModuleRegex,
          use: transformStyleLoaders(
            userConfig,
            paths,
            {
              importLoaders: 5,
              sourceMap: isEnvProduction ? useSourceMap : isEnvDevelopment,
              modules: {
                mode: 'local',
                getLocalIdent: getLocalIdent,
              },
            },
            'stylus-loader',
          ),
        },
      ]
    : []

  return [
    // "postcss" loader applies autoprefixer to our CSS.
    // "css" loader resolves paths in CSS and adds assets as dependencies.
    // "style" loader turns CSS into JS modules that inject <style> tags.
    // In production, we use MiniCSSExtractPlugin to extract that CSS
    // to a file, but in development "style" loader enables hot editing
    // of CSS.
    // By default we support CSS Modules with the extension .module.css
    ...cssRule,
    ...sassRule,
    ...lessRule,
    ...stylusRule,
  ]
}

const getScriptLoaders = (userConfig: UserConfigType, paths: PathsType) => {
  const isEnvDevelopment = process.env.NODE_ENV === 'development'
  const isEnvProduction = process.env.NODE_ENV === 'production'
  const useSourceMap = process.env.USE_SOURCEMAP === 'true'

  const {
    loader: { swc, esbuild, babel },
  } = userConfig

  if (swc.enable) {
    return [
      {
        test: /\.(js|mjs|jsx|ts|mts|tsx)$/,
        include: paths.appSrc,
        loader: require.resolve('swc-loader'),
        options: deepMergeWithArray(swc['options'], {
          swcrc: false,
          configFile: false,
          env: {
            // path specifies the directory to load the browserslist module and any browserslist configuration files.
            path: paths.appPath,
            mode: 'entry',
            coreJs: extractPkgJson('version', 'core-js/package.json'),
          },
          jsc: {
            externalHelpers: true,
            parser: {
              syntax: 'typescript',
              tsx: true,
              decorators: true,
              dynamicImport: true,
            },
            transform: {
              legacyDecorator: true,
              react: {
                runtime: 'automatic',
                development: isEnvDevelopment,
                refresh: isEnvDevelopment,
              },
            },
          },
        } as SwcOptions),
      },
      // {
      //   test: /\.(js|mjs)$/,
      //   exclude: /@babel(?:\/|\\{1,2})runtime/,
      //   loader: require.resolve('swc-loader'),
      //   options: deepMergeWithArray(swc['options'], {
      //     env: {
      //       // path specifies the directory to load the browserslist module and any browserslist configuration files.
      //       path: paths.appPath,
      //       mode: 'entry',
      //       coreJs: '3',
      //     },
      //     jsc: {
      //       externalHelpers: true,
      //       parser: {
      //         syntax: 'ecmascript',
      //         jsx: true,
      //         dynamicImport: true,
      //       },
      //     },
      //   } as SwcOptions),
      // },
    ]
  } else if (esbuild.enable) {
    return [
      {
        test: /\.(js|mjs|jsx|ts|mts|tsx)$/,
        include: paths.appSrc,
        loader: require.resolve('esbuild-loader'),
        options: deepMergeWithArray(esbuild['options'], {
          target: browserslistToEsbuild(),
          format: 'esm',
          jsx: 'automatic',
        } as EsbuildOptions),
      },
      // {
      //   test: /\.(js|mjs)$/,
      //   exclude: /@babel(?:\/|\\{1,2})runtime/,
      //   loader: require.resolve('esbuild-loader'),
      //   options: deepMergeWithArray(esbuild['options'], {
      //     target: browserslistToEsbuild(),
      //     format: 'esm',
      //     jsx: 'transform',
      //   } as EsbuildOptions),
      // },
    ]
  } else if (babel.enable) {
    return [
      // Process application JS with Babel.
      // The preset includes JSX, Flow, TypeScript, and some ESnext features.
      {
        test: /\.(js|mjs|jsx|ts|mts|tsx)$/,
        include: paths.appSrc,
        loader: require.resolve('babel-loader'),
        options: deepMergeWithArray(babel['options'], {
          customize: require.resolve(
            '@mango-scripts/babel-preset-mango/customize',
          ),
          presets: [
            [
              require.resolve('@mango-scripts/babel-preset-mango/source'),
              {
                runtime: 'automatic',
              },
            ],
          ],
          babelrc: false,
          configFile: false,
          plugins: [
            isEnvDevelopment && require.resolve('react-refresh/babel'),
          ].filter(Boolean),
          // This is a feature of `babel-loader` for webpack (not Babel itself).
          // It enables caching results in ./node_modules/.cache/babel-loader/
          // directory for faster rebuilds.
          cacheDirectory: true,
          // See #6846 for context on why cacheCompression is disabled
          cacheCompression: false,
          compact: isEnvProduction,
        }),
      },
      // Process any JS outside of the app with Babel.
      // Unlike the application JS, we only compile the standard ES features.
      {
        test: /\.(js|mjs)$/,
        exclude: /@babel(?:\/|\\{1,2})runtime/,
        loader: require.resolve('babel-loader'),
        options: {
          babelrc: false,
          configFile: false,
          compact: false,
          presets: [
            [
              require.resolve('@mango-scripts/babel-preset-mango/dependencies'),
              { helpers: true },
            ],
          ],
          cacheDirectory: true,
          // See #6846 for context on why cacheCompression is disabled
          cacheCompression: false,
          // Babel sourcemaps are needed for debugging into node_modules
          // code.  Without the options below, debuggers like VSCode
          // show incorrect code and set breakpoints on the wrong lines.
          sourceMaps: useSourceMap,
          inputSourceMap: useSourceMap,
        },
      },
    ]
  } else {
    return []
  }
}

export const getModuleRules = (
  userConfig: UserConfigType,
  paths: PathsType,
) => {
  const useSourceMap = process.env.USE_SOURCEMAP === 'true'

  const loaders: RuleSetRule[] = [
    {
      // "oneOf" will traverse all following loaders until one will
      // match the requirements. When no loader matches it will fall
      // back to the "file" loader at the end of the loader list.
      oneOf: [
        // TODO: Merge this config once `image/avif` is in the mime-db
        // https://github.com/jshttp/mime-db
        {
          test: [/\.avif$/],
          type: 'asset',
          mimetype: 'image/avif',
          parser: {
            dataUrlCondition: {
              maxSize: 10000,
            },
          },
        },
        // "url" loader works like "file" loader except that it embeds assets
        // smaller than specified limit in bytes as data URLs to avoid requests.
        // A missing `test` is equivalent to a match.
        {
          test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 10000,
            },
          },
        },
        ...getSvgLoaders(userConfig, paths),
        ...getScriptLoaders(userConfig, paths),
        ...getStyleLoaders(userConfig, paths),
        // "file" loader makes sure those assets get served by WebpackDevServer.
        // When you `import` an asset, you get its (virtual) filename.
        // In production, they would get copied to the `build` folder.
        // This loader doesn't use a "test" so it will catch all modules
        // that fall through the other loaders.
        {
          // Exclude `js` files to keep "css" loader working as it injects
          // its runtime that would otherwise be processed through "file" loader.
          // Also exclude `html` and `json` extensions so they get processed
          // by webpacks internal loaders.
          exclude: [/^$/, /\.(js|mjs|jsx|ts|mts|tsx)$/, /\.html$/, /\.json$/],
          type: 'asset/resource',
        },
        // ** STOP ** Are you adding a new loader?
        // Make sure to add the new loader(s) before the "file" loader.
      ],
    },
  ]

  // Handle node_modules packages that contain sourcemaps
  if (useSourceMap) {
    loaders.unshift({
      enforce: 'pre',
      exclude: /@babel(?:\/|\\{1,2})runtime/,
      test: /\.(js|mjs|jsx|ts|mts|tsx|css)$/,
      loader: require.resolve('source-map-loader'),
    })
  }

  return loaders
}
