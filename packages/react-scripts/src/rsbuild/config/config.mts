import { join } from 'node:path'

import { defineConfig, loadConfig, mergeRsbuildConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import { pluginTypeCheck } from '@rsbuild/plugin-type-check'
import { pluginSvgr } from '@rsbuild/plugin-svgr'
import { pluginStylus } from '@rsbuild/plugin-stylus'
import { pluginBabel } from '@rsbuild/plugin-babel'

import { getEnv } from '../../common/getEnv.mjs'

import type { PathsType } from '../../common/getPaths.mjs'
import type { RsbuildConfig } from '@rsbuild/core'

export const getRsbuildConfig = async (
  devConfig: RsbuildConfig,
  paths: PathsType,
) => {
  // We will provide `paths.publicUrlOrPath` to our app
  // as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
  // Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
  // Get environment variables to inject into our app.
  const env = getEnv(paths.publicUrlOrPath.slice(0, -1))

  const defaultConfig = defineConfig({
    plugins: [
      pluginReact(),
      pluginTypeCheck(),
      pluginSvgr(),
      pluginStylus(),
      pluginBabel({
        babelLoaderOptions: (config, { addPlugins }) => {
          addPlugins([require.resolve('babel-plugin-jsx-css-modules')])
        },
      }),
    ],
    output: {
      polyfill: 'entry',
      legalComments: 'none',
      filename:
        process.env.NODE_ENV === 'production'
          ? {
              js: '[name].[contenthash:16].js',
              css: '[name].[contenthash:16].css',
              svg: '[name].[contenthash:16].svg',
              font: '[name].[contenthash:16][ext]',
              image: '[name].[contenthash:16][ext]',
              media: '[name].[contenthash:16][ext]',
            }
          : {
              js: '[name].js',
              css: '[name].css',
              svg: '[name].[contenthash:16].svg',
              font: '[name].[contenthash:16][ext]',
              image: '[name].[contenthash:16][ext]',
              media: '[name].[contenthash:16][ext]',
            },
    },
    tools: {
      postcss: (config, { addPlugins }) => {
        // addPlugins(tailwindcss)
      },
      bundlerChain(chain, utils) {
        chain.module
          .rule('svg')
          .oneOf('sprite')
          .test(/./)
          .include.add(paths.svgSpritePath)
          .end()
          .before('svg-asset-url')
          .use('compat-svg-sprite-loader')
          .loader(join(__dirname, '../loader/compat-svg-sprite-loader.mjs'))
          .options({ symbolId: 'icon-[name]' })
          .end()
          .use('svgo')
          .loader(require.resolve('svgo-loader'))
      },
    },
    source: {
      define: env.stringified,
    },
    performance: { prefetch: true },
  })

  const userConfig = await loadConfig({
    cwd: process.cwd(),
    path: join(process.cwd(), 'mango.config.mjs'),
  })

  return mergeRsbuildConfig(defaultConfig, devConfig, userConfig)
}
