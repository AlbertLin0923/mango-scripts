import fs from 'fs-extra'
import pico from 'picocolors'

export const isObject = (d: any) => {
  return Object.prototype.toString.call(d) === '[object Object]'
}

export const objToArr = (obj: Record<string, any>) => {
  return Object.entries(obj).map(([key, value]) => {
    return {
      key,
      value
    }
  })
}

export const compareLocaleData = async (
  oldFilePath: string,
  newFilePath: string
) => {
  let oldString = '{}'
  let newString = '{}'

  try {
    oldString = await fs.readFile(oldFilePath, { encoding: 'utf-8' })
  } catch (error) {
    oldString = '{}'
  }

  try {
    newString = await fs.readFile(newFilePath, { encoding: 'utf-8' })
  } catch (error) {
    newString = '{}'
  }

  let oldObj = {}
  let newObj = {}
  let oldArr = []
  let newArr = []
  try {
    oldObj = JSON.parse(oldString)
    newObj = JSON.parse(newString)
    oldArr = objToArr(oldObj)
    newArr = objToArr(newObj)
  } catch (error: any) {
    throw new Error(pico.red('文件比对:文件解析失败'), error)
  }

  let sameNumber = 0
  let addNumber = 0
  let modifyNumber = 0
  let deleteNumber = 0

  for (let index = 0; index < newArr.length; index++) {
    const newItem = newArr[index]
    const findSameKeyItem = oldArr.find((oldItem) => {
      return newItem.key === oldItem.key
    })
    if (!findSameKeyItem) {
      addNumber++
    } else {
      if (findSameKeyItem.value === newItem.value) {
        sameNumber++
      } else {
        modifyNumber++
      }
    }
  }

  for (let index = 0; index < oldArr.length; index++) {
    const oldItem = oldArr[index]
    const findSameKeyItem = newArr.find((newItem) => {
      return oldItem.key === newItem.key
    })
    if (!findSameKeyItem) {
      deleteNumber++
    }
  }

  return {
    sameNumber,
    addNumber,
    modifyNumber,
    deleteNumber
  }
}

const formatString = (str: string) => {
  return str.replace(/[\n\r\t]/g, '').trim()
}

export const cusJsonStringify = (obj: Record<string, string>) => {
  const formatObj: Record<string, string> = {}

  Object.entries(obj).forEach(([key, value]) => {
    formatObj[formatString(key)] = formatString(value)
  })

  return JSON.stringify(formatObj, Object.keys(formatObj).sort(), 2)
}
