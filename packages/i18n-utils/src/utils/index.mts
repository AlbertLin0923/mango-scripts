import path from 'node:path'
import crypto from 'node:crypto'

import { fs } from '@mango-scripts/utils'

export type LocaleItem = {
  'zh-CN': string
  modules: string
}

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
  ignoreFile = '',
): string[] => {
  return fs.readdirSync(dir).reduce((fileList, file) => {
    const name: string = path.join(dir, file)

    const isDirectory: boolean = fs.statSync(name).isDirectory()
    const isFile: boolean = fs.statSync(name).isFile()

    if (isDirectory) {
      return fileList.concat(
        getFilePathList(name, filterExtNameList, ignoreDirectory, ignoreFile),
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

export const uniArr = (objArr: LocaleItem[]) => {
  if (objArr.length === 0) {
    return []
  }
  const hash: any = {}
  return objArr.reduce((item: LocaleItem[], next) => {
    hash[next['zh-CN']]
      ? (item = item.map((i) => {
          if (i['zh-CN'] === next['zh-CN']) {
            return (i = {
              'zh-CN': i['zh-CN'],
              modules: combineModules(i['modules'], next['modules']),
            })
          } else {
            return i
          }
        }))
      : (hash[next['zh-CN']] = true && item.push(next))
    return item
  }, [] as LocaleItem[])
}

export const matchModuleMark = (code: string): string => {
  const MATCH_MODULE_MARK_A = /(?<=\/\/.*?translateModules:.*?\[)(.*?)(?=\])/g
  // eslint-disable-next-line no-useless-escape
  const MATCH_MODULE_MARK_B = /(?<=\<!--.*?translateModules:.*?\[)(.*?)(?=\])/g
  const MATCH_STRING_CONTENT = /(?<=['"`])(.*?)(?=['"`])/g
  const result =
    code.match(MATCH_MODULE_MARK_A) || code.match(MATCH_MODULE_MARK_B)

  if (result) {
    return result?.[0]
      .split(',')
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

export const collectDisableRuleCommentlocation = (comments: any) => {
  let entireFileDisabled = false
  const partialCommentList: any[] = []
  const nextLineCommentList: any[] = []
  const thisLineCommentList: any[] = []

  const tmp_partialCommentList: any[] = []

  if (
    comments.some((comment: any) =>
      /translate-disable-entire-file/.test(comment.value),
    )
  ) {
    entireFileDisabled = true
  } else {
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
  }

  return {
    entireFileDisabled,
    partialCommentList,
    nextLineCommentList,
    thisLineCommentList,
  }
}

export const inDisableRuleCommentlocation = (
  entireFileDisabled: boolean,
  partialCommentList: any,
  nextLineCommentList: any,
  thisLineCommentList: any,
  startLine: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  endLine: number,
) => {
  // 存在文件忽略标识，整个文件忽略
  if (entireFileDisabled === true) {
    return true
  }
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

export const isLegalLocaleStr = (str: string): boolean => {
  return str ? true : false
}

export const formatLocaleStr = (str: any): string => {
  return String(str)
    .replace(/[\n\r\t]/g, '')
    .trim()
}

export const formatLocaleObj = (localeObj: Record<string, any>) => {
  const r: Record<string, any> = {}
  Object.entries(localeObj).forEach(([key, value]) => {
    r[formatLocaleStr(key)] = formatLocaleStr(value)
  })
  return r
}

export const formatLocaleKeyList = (localeList: LocaleItem[]) => {
  return localeList
    .map((i) => {
      i['zh-CN'] = formatLocaleStr(i['zh-CN'])
      return i
    })
    .filter((i) => isLegalLocaleStr(i['zh-CN']))
}

export const deleteCodeComments = (code: string): string => {
  return code
    .replace(/(\/\/.*)|(\/\*[\s\S]*?\*\/)/g, '')
    .replace(/<!--[\w\W\r\n]*?-->/gim, '')
}
