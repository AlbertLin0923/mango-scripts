import * as fs from 'fs-extra'

import { regexExtractor } from './regexExtractor.mjs'
import { astExtractor } from './astExtractor.mjs'

import {
  uniArr,
  getFilePathList,
  matchModuleMark,
  getContentHash,
  formatLocaleKeyList,
} from '../utils/index.ts'

export type LocaleItem = {
  'zh-CN': string
  modules: string
}

export interface ExecResult {
  success: boolean
  message: string[]
  readResult: any[]
}

export type Extractor = 'ast' | 'regex'

export const extractChineseFieldList = async (
  extractor: Extractor,
  resolvePathList: string[],
  filterExtNameList: string[],
  sourceCodeContentHashMapPath?: string,
): Promise<LocaleItem[]> => {
  const filePathList = resolvePathList.reduce(
    (previousValue: string[], currentValue: string) => {
      return previousValue.concat(
        getFilePathList(currentValue, filterExtNameList),
      )
    },
    [],
  )

  let contentHashMap: Record<string, string> = {}

  if (sourceCodeContentHashMapPath) {
    // 不存在contentHash文件则创建它
    const sourceCodeContentHashMapPathExist = await fs.pathExists(
      sourceCodeContentHashMapPath,
    )
    if (!sourceCodeContentHashMapPathExist) {
      await fs.outputFile(
        sourceCodeContentHashMapPath,
        JSON.stringify({}, null, 2),
      )
    }
    contentHashMap = await fs.readJSON(sourceCodeContentHashMapPath)
  }

  const localeList: LocaleItem[] = []

  for (let index = 0; index < filePathList.length; index++) {
    const filePath = filePathList[index]
    const resString = await fs.readFile(filePath, { encoding: 'utf-8' })
    if (sourceCodeContentHashMapPath) {
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
            modules,
          }
        })
        // 写入contentHash文件
        contentHashMap[filePath] = contentHash
        localeList.push(...chineseFieldList)
      }
    } else {
      const modules = matchModuleMark(resString)
      const chineseFieldList = (
        extractor === 'regex'
          ? regexExtractor(resString)
          : astExtractor(resString, filePath)
      ).map((i) => {
        return {
          'zh-CN': i,
          modules,
        }
      })
      localeList.push(...chineseFieldList)
    }
  }

  const formatLocaleList = uniArr(formatLocaleKeyList(localeList))
  if (sourceCodeContentHashMapPath) {
    await fs.outputFile(
      sourceCodeContentHashMapPath,
      JSON.stringify(contentHashMap, null, 2),
    )
  }

  return formatLocaleList
}
