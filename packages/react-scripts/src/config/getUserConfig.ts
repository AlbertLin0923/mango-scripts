import fs from 'fs-extra'
import _ from 'lodash'
import { cosmiconfigSync } from 'cosmiconfig'

export const deepMergeWithArray = (object: any, sources: any) => {
  return _.mergeWith(object, sources, (objValue: any, srcValue: any) => {
    if (Array.isArray(objValue)) {
      return objValue.concat(srcValue)
    }
  })
}

export const getUserConfig = (targetConfigObjPath: string) => {
  const projectRoot = fs.realpathSync(process.cwd())

  const userConfigExplorer = cosmiconfigSync('mango')

  const defaultUserConfig = {
    distDir: 'dist',
    loader: {
      babel: {
        options: {}
      },
      less: {
        options: {}
      },
      sass: {
        options: {}
      },
      stylus: {
        options: {}
      },
      postcss: {
        options: {}
      }
    },
    plugin: {
      eslint: {
        enable: true,
        options: {}
      },
      stylelint: {
        enable: true,
        options: {}
      },
      typescript: {
        enable: true,
        options: {}
      }
    },
    optimization: {
      splitChunks: {},
      minimizer: {
        jsMinimizer: {
          minify: 'terserMinify', // terserMinify | uglifyJsMinify | esbuildMinify | swcMinify
          terserOptions: {}
        },
        cssMinimizer: {
          minify: 'cssnanoMinify', // cssnanoMinify | cssoMinify | cleanCssMinify | esbuildMinify  | lightningCssMinify | swcMinify
          minimizerOptions: {}
        }
      }
    },
    mfsu: false
  }

  const userConfigFilePath = userConfigExplorer.search(projectRoot)

  if (userConfigFilePath !== null) {
    const userConfig = userConfigExplorer.load(userConfigFilePath.filepath)

    if (!userConfig?.config) {
      throw new Error("mango: Config function didn't return a config object.")
    }

    return _.get(deepMergeWithArray(userConfig?.config, defaultUserConfig), targetConfigObjPath)
  }

  return _.get(defaultUserConfig, targetConfigObjPath)
}
