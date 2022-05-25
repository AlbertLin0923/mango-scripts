import * as path from 'path'
import * as fs from 'fs-extra'
import * as crypto from 'crypto'

import { LocaleItem } from '../types/index'

/**
 * @description: 获取目标文件下符合条件的文件路径
 * @param {string} dir 目标绝对地址目录
 * @param {Array<string>} filterExtNameList 目标文件的后缀名数组
 * @param {string} ignoreDirectory 忽略的文件夹名字
 * @param {string} ignoreFile 忽略的文件名
 * @return {Array<string>} 返回文件路径数组
 */
export const getFilePathList = (
  dir: string,
  filterExtNameList = [''],
  ignoreDirectory = '',
  ignoreFile = ''
): Array<string> => {
  return fs.readdirSync(dir).reduce((fileList, file) => {
    const name: string = path.join(dir, file)

    const isDirectory: boolean = fs.statSync(name).isDirectory()
    const isFile: boolean = fs.statSync(name).isFile()

    if (isDirectory) {
      return fileList.concat(
        getFilePathList(name, filterExtNameList, ignoreDirectory, ignoreFile)
      )
    }

    const isIgnoreDirectoy: boolean =
      !ignoreDirectory ||
      (!!ignoreDirectory &&
        !path.dirname(name).split('/').includes(ignoreDirectory))

    const isIgnoreFile: boolean =
      !ignoreFile || (!!ignoreFile && path.basename(name) !== ignoreFile)

    if (isFile && isIgnoreDirectoy && isIgnoreFile) {
      const extname = path.extname(name)

      if (filterExtNameList.includes(extname)) {
        return fileList.concat(name)
      }
    }
    return fileList
  }, [] as string[])
}

const combineModules = (module1: string, module2: string): string => {
  const a = module1 ? module1.split(',') : []
  const b = module2 ? module2.split(',') : []
  return Array.from(new Set([...a, ...b])).join(',')
}

export const uniArr = (objArr: Array<LocaleItem>) => {
  if (objArr.length === 0) {
    return []
  }
  const hash: any = {}
  return objArr.reduce((item: Array<LocaleItem>, next) => {
    hash[next['zh-CN']]
      ? (item = item.map((i) => {
          if (i['zh-CN'] === next['zh-CN']) {
            return (i = {
              'zh-CN': i['zh-CN'],
              modules: combineModules(i['modules'], next['modules'])
            })
          } else {
            return i
          }
        }))
      : (hash[next['zh-CN']] = true && item.push(next))
    return item
  }, [] as Array<LocaleItem>)
}

export const matchModuleMark = (code: string): string => {
  const MATCH_MODULE_MARK_A = /(?<=\/\/.*?translateModules:.*?\[)(.*?)(?=\])/g
  const MATCH_MODULE_MARK_B = /(?<=\<!--.*?translateModules:.*?\[)(.*?)(?=\])/g
  const MATCH_STRING_CONTENT = /(?<=['"`])(.*?)(?=['"`])/g
  let result =
    code.match(MATCH_MODULE_MARK_A) || code.match(MATCH_MODULE_MARK_B)

  if (result) {
    result = result[0].split(',')
    return result
      .map((i) => {
        const m = i.match(MATCH_STRING_CONTENT)
        if (m) {
          return m[0]
        }
      })
      .filter((i) => {
        return i ? true : false
      })
      .join(',')
  } else {
    return ''
  }
}

export const compareLocaleData = (oldFilePath: string, newFilePath: string) => {
  const oldString = fs.readFileSync(oldFilePath, { encoding: 'utf-8' })
  const newString = fs.readFileSync(newFilePath, { encoding: 'utf-8' })

  let oldArr = []
  let newArr = []
  try {
    oldArr = JSON.parse(oldString)
    newArr = JSON.parse(newString)
  } catch (error) {
    console.log(error)
    throw new Error('文件解析失败')
  }

  let sameNumber = 0
  let addNumber = 0
  let deleteNumber = 0
  const addItemArr = []
  const deleteItemArr = []

  for (let index = 0; index < newArr.length; index++) {
    const newItem = newArr[index]

    const findSameItem = oldArr.find((oldItem: any) => {
      return newItem['zh-CN'] === oldItem['zh-CN']
    })

    if (!findSameItem) {
      addNumber++
      addItemArr.push(newItem)
    } else {
      sameNumber++
    }
  }

  for (let index = 0; index < oldArr.length; index++) {
    const oldItem = oldArr[index]
    const findSameItem = newArr.find((newItem: any) => {
      return newItem['zh-CN'] === oldItem['zh-CN']
    })
    if (!findSameItem) {
      deleteNumber++
      deleteItemArr.push(oldItem)
    }
  }

  return {
    sameNumber,
    addNumber,
    deleteNumber,
    addItemArr,
    deleteItemArr
  }
}

export const collectDisableRuleCommentlocation = (comments: any) => {
  const partialCommentList: Array<any> = []
  const nextLineCommentList: Array<any> = []
  const thisLineCommentList: Array<any> = []

  const tmp_partialCommentList: Array<any> = []

  comments.forEach((comment: any) => {
    if (/translate-disable-next-line/.test(comment.value)) {
      nextLineCommentList.push(comment.loc.end.line)
    } else if (/translate-disable-line/.test(comment.value)) {
      thisLineCommentList.push(comment.loc.start.line)
    } else if (/translate-disable/.test(comment.value)) {
      tmp_partialCommentList.push(comment.loc.end.line)
    }
  })

  tmp_partialCommentList
    .sort((a, b) => {
      return a - b
    })
    .forEach((item, index) => {
      if (index % 2) {
        partialCommentList[partialCommentList.length - 1][1] = item
      } else {
        partialCommentList.push([item])
      }
    })

  return { partialCommentList, nextLineCommentList, thisLineCommentList }
}

export const inDisableRuleCommentlocation = (
  partialCommentList: any,
  nextLineCommentList: any,
  thisLineCommentList: any,
  startLine: number,
  endLine: number
) => {
  // 字符串在nextLineComment下一行，则忽略
  if (nextLineCommentList.indexOf(startLine - 1) > -1) return true

  // 字符串在thislineComment同行，则忽略
  if (thisLineCommentList.indexOf(startLine) > -1) return true

  // 字符串在partialComment包裹之内，则忽略
  for (let index = 0; index < partialCommentList.length; index++) {
    const pc = partialCommentList[index]
    if (pc[0] < startLine && pc[1] > startLine) {
      return true
    }
  }
}

export const getContentHash = (content: string): string => {
  return crypto.createHash('md5').update(content).digest('hex')
}

export const isLegalLocaleKey = (str: string): boolean => {
  return str ? true : false
}

export const formatLocaleKeyStr = (str: string): string => {
  return String(str)
    .replace(/[\n\r\t]/g, '')
    .trim()
}

export const formatLocaleKeyList = (localeList: LocaleItem[]) => {
  return localeList
    .map((i) => {
      i['zh-CN'] = formatLocaleKeyStr(i['zh-CN'])
      return i
    })
    .filter((i) => isLegalLocaleKey(i['zh-CN']))
}

export const deleteCodeComments = (code: string): string => {
  return code
    .replace(/(\/\/.*)|(\/\*[\s\S]*?\*\/)/g, '')
    .replace(/<!--[\w\W\r\n]*?-->/gim, '')
}
