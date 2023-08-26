import fs from 'fs-extra'
import _ from 'lodash'
import { cosmiconfigSync } from 'cosmiconfig'

const deepMergeWithArray = (object: any, sources: any) => {
  return _.mergeWith(object, sources, (objValue: any, srcValue: any) => {
    if (Array.isArray(objValue)) {
      return objValue.concat(srcValue)
    }
  })
}

export const mergeBabelConfig = (options: any) => {
  const projectRoot = fs.realpathSync(process.cwd())

  const babelConfigExplorer = cosmiconfigSync('babel', {
    searchPlaces: ['package.json', `babel.config.js`, `.babelrc.js`, `.babelrc`]
  })

  let babelConfig: any = {}

  const configFilePath = babelConfigExplorer.search(projectRoot)

  if (configFilePath !== null) {
    const config = babelConfigExplorer.load(configFilePath.filepath)

    babelConfig = config?.config

    if (!babelConfig) {
      throw new Error("babel: Config function didn't return a config object.")
    }
  }

  return deepMergeWithArray(babelConfig, options)
}

export const mergePreProcessorConfig = (preProcessorName: string, options: any) => {
  const projectRoot = fs.realpathSync(process.cwd())

  const preProcessorConfigExplorer = cosmiconfigSync('preProcessor', {
    searchPlaces: [
      'package.json',
      `preProcessor.config.js`,
      `.preProcessorrc.js`,
      `.preProcessorrc`
    ]
  })

  let preProcessorConfig: any = {}

  const configFilePath = preProcessorConfigExplorer.search(projectRoot)

  if (configFilePath !== null) {
    const config = preProcessorConfigExplorer.load(configFilePath.filepath)

    preProcessorConfig = config?.config

    if (!preProcessorConfig) {
      throw new Error("preProcessor: Config function didn't return a config object.")
    }
  }

  const config = preProcessorConfig[preProcessorName] || {}
  return deepMergeWithArray(config, options)
}

export const mergeTerserOptionsConfig = (options: any) => {
  const projectRoot = fs.realpathSync(process.cwd())

  const terserOptionsConfigExplorer = cosmiconfigSync('terserOptions', {
    searchPlaces: [
      'package.json',
      `terserOptions.config.js`,
      `.terserOptionsrc.js`,
      `.terserOptionsrc`
    ]
  })

  let terserOptionsConfig: any = {}

  const configFilePath = terserOptionsConfigExplorer.search(projectRoot)

  if (configFilePath !== null) {
    const config = terserOptionsConfigExplorer.load(configFilePath.filepath)

    terserOptionsConfig = config?.config

    if (!terserOptionsConfig) {
      throw new Error("terserOptions: Config function didn't return a config object.")
    }
  }

  return deepMergeWithArray(terserOptionsConfig, options)
}
