import fs from 'fs-extra'
import { mergeWith, get, isArray } from 'lodash'
import { cosmiconfigSync } from 'cosmiconfig'

import { defaultUserConfig } from '../defineConfig'

import type { ConfigType } from '../defineConfig'

export const deepMergeWithArray = <T>(object: T, sources: T): T => {
  return mergeWith(object, sources, (objValue, srcValue) => {
    if (isArray(objValue)) {
      return objValue.concat(srcValue)
    }
  })
}

export const getUserConfig = (targetConfigObjPath: string) => {
  const userConfigExplorer = cosmiconfigSync('mango')

  const userConfigFilePath = userConfigExplorer.search(
    fs.realpathSync(process.cwd()),
  )

  if (userConfigFilePath !== null) {
    const userConfig = userConfigExplorer.load(userConfigFilePath.filepath)

    if (!userConfig?.config) {
      throw new Error("mango: Config function didn't return a config object.")
    }

    return get(
      deepMergeWithArray(defaultUserConfig, userConfig?.config as ConfigType),
      targetConfigObjPath,
    )
  }

  return get(defaultUserConfig, targetConfigObjPath)
}
