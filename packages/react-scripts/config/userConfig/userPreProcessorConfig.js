const fs = require('fs')
const { cosmiconfigSync } = require('cosmiconfig')
const _ = require('lodash')
const projectRoot = fs.realpathSync(process.cwd())

const deepMergeWithArray = (object, sources) => {
  return _.mergeWith(object, sources, (objValue, srcValue) => {
    if (Array.isArray(objValue)) {
      return objValue.concat(srcValue)
    }
  })
}

const preProcessorExplorer = cosmiconfigSync('preProcessor', {
  searchPlaces: ['package.json', `preProcessor.config.js`, `.preProcessorrc.js`, `.preProcessorrc`]
})

let userPreProcessorConfig = {}

const configFilePath = preProcessorExplorer.search(projectRoot)

if (configFilePath !== null) {
  const config = preProcessorExplorer.load(configFilePath.filepath)

  userPreProcessorConfig = config.config

  if (!userPreProcessorConfig) {
    throw new Error("preProcessor: Config function didn't return a config object.")
  }
}

const mergeUserPreProcessorConfig = (preProcessorName, options) => {
  const userConfig = userPreProcessorConfig[preProcessorName] || {}
  return deepMergeWithArray(userConfig, options)
}

module.exports = { mergeUserPreProcessorConfig }
