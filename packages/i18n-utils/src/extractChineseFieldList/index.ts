import * as fs from 'fs-extra'
import { LocaleItem, Extractor } from '../types/index'
import regexExtractor from './regexExtractor'
import astExtractor from './astExtractor'

import {
  uniArr,
  getFilePathList,
  matchModuleMark,
  getContentHash,
  formatLocaleKeyList
} from '../utils/index'

const bootstrap = async (
  resolvePathList: Array<string>,
  filterExtNameList: Array<string>,
  sourceCodeContentHashMapPath: string,
  extractor: Extractor
): Promise<Array<LocaleItem>> => {
  const filePathList = resolvePathList.reduce(
    (previousValue: string[], currentValue: string) => {
      return previousValue.concat(
        getFilePathList(currentValue, filterExtNameList)
      )
    },
    []
  )

  // 不存在contentHash文件则创建它
  const sourceCodeContentHashMapPathExist = await fs.pathExists(
    sourceCodeContentHashMapPath
  )
  if (!sourceCodeContentHashMapPathExist) {
    await fs.outputFile(
      sourceCodeContentHashMapPath,
      JSON.stringify({}, null, 2)
    )
  }
  const contentHashMap = await fs.readJSON(sourceCodeContentHashMapPath)

  const localeList: Array<LocaleItem> = []

  for (let index = 0; index < filePathList.length; index++) {
    const filePath = filePathList[index]
    const resString = await fs.readFile(filePath, { encoding: 'utf-8' })
    const contentHash = getContentHash(resString)
    const isContentModify = contentHashMap[filePath] !== contentHash
    if (isContentModify) {
      const modules = matchModuleMark(resString)
      const chineseFieldList = (
        extractor === 'regex'
          ? regexExtractor(resString)
          : astExtractor(resString, filePath)
      ).map((i) => {
        return {
          'zh-CN': i,
          modules
        }
      })

      // 写入contentHash文件
      contentHashMap[filePath] = contentHash
      localeList.push(...chineseFieldList)
    }
  }

  const formatLocaleList = uniArr(formatLocaleKeyList(localeList))
  await fs.outputFile(
    sourceCodeContentHashMapPath,
    JSON.stringify(contentHashMap, null, 2)
  )
  return formatLocaleList
}

export default bootstrap
