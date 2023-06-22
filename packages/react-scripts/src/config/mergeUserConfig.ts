import fs from 'fs-extra'
import { cosmiconfigSync } from 'cosmiconfig'
import _ from 'lodash'

const deepMergeWithArray = (object: any, sources: any) => {
  return _.mergeWith(object, sources, (objValue: any, srcValue: any) => {
    if (Array.isArray(objValue)) {
      return objValue.concat(srcValue)
    }
  })
}

export const mergeUserBabelConfig = (options: any) => {
  const projectRoot = fs.realpathSync(process.cwd())

  const babelrcExplorer = cosmiconfigSync('babel', {
    searchPlaces: ['package.json', `babel.config.js`, `.babelrc.js`, `.babelrc`]
  })

  let userBabelConfig: any = {}

  const configFilePath = babelrcExplorer.search(projectRoot)

  if (configFilePath !== null) {
    const config = babelrcExplorer.load(configFilePath.filepath)

    userBabelConfig = config?.config

    if (!userBabelConfig) {
      throw new Error("babel: Config function didn't return a config object.")
    }
  }

  return deepMergeWithArray(userBabelConfig, options)
}

export const mergeUserPreProcessorConfig = (preProcessorName: string, options: any) => {
  const projectRoot = fs.realpathSync(process.cwd())

  const preProcessorExplorer = cosmiconfigSync('preProcessor', {
    searchPlaces: [
      'package.json',
      `preProcessor.config.js`,
      `.preProcessorrc.js`,
      `.preProcessorrc`
    ]
  })

  let userPreProcessorConfig: any = {}

  const configFilePath = preProcessorExplorer.search(projectRoot)

  if (configFilePath !== null) {
    const config = preProcessorExplorer.load(configFilePath.filepath)

    userPreProcessorConfig = config?.config

    if (!userPreProcessorConfig) {
      throw new Error("preProcessor: Config function didn't return a config object.")
    }
  }

  const userConfig = userPreProcessorConfig[preProcessorName] || {}
  return deepMergeWithArray(userConfig, options)
}
