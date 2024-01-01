import { fs } from '@mango-scripts/utils'
import { mergeWith, isArray } from 'lodash-es'
import { cosmiconfig } from 'cosmiconfig'

import { userDefaultWebpackConfig } from '../../defineConfig.mjs'

import type { UserConfigType } from '../../defineConfig.mjs'

export const deepMergeWithArray = <T,>(object: T, sources: T): T => {
  return mergeWith(object, sources, (objValue, srcValue) => {
    if (isArray(objValue)) {
      return objValue.concat(srcValue)
    }
  })
}

export const getUserConfig = async (): Promise<UserConfigType> => {
  const explorer = cosmiconfig('mango')
  try {
    const result = await explorer.search(fs.realpathSync(process.cwd()))
    // config: The parsed configuration object. undefined if the file is empty.
    return deepMergeWithArray(userDefaultWebpackConfig, result?.config || {})
  } catch (error) {
    throw new Error("mango: Config function didn't return a config object.")
  }
}
