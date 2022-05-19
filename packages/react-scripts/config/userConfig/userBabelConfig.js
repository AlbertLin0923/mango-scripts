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

const babelrcExplorer = cosmiconfigSync('babel', {
  searchPlaces: ['package.json', `babel.config.js`, `.babelrc.js`, `.babelrc`]
})

let userBabelConfig = {}

const configFilePath = babelrcExplorer.search(projectRoot)

if (configFilePath !== null) {
  const config = babelrcExplorer.load(configFilePath.filepath)

  userBabelConfig = config.config

  if (!userBabelConfig) {
    throw new Error("babel: Config function didn't return a config object.")
  }
}

const mergeUserBabelConfig = (options) => {
  return deepMergeWithArray(userBabelConfig, options)
}

module.exports = { mergeUserBabelConfig }
