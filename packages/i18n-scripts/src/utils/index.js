const fs = require('fs-extra')
const path = require('path')

function copyDir(from, to) {
  try {
    fs.accessSync(to)
  } catch (e) {
    fs.mkdirSync(to)
  }

  try {
    fs.readdirSync(from).forEach(function (p) {
      let _f = from + '/' + p
      let _t = to + '/' + p
      try {
        let stat = fs.statSync(_f)
        if (stat.isFile()) {
          fs.writeFileSync(_t, fs.readFileSync(_f))
        } else if (stat.isDirectory()) {
          copyDir(_f, _t)
        }
      } catch (e) {
        console.log(e)
      }
    })
  } catch (e) {
    console.log(e)
  }
}

function makeDeepDirSync(dirPath) {
  if (fs.existsSync(dirPath)) {
    return true
  } else {
    if (makeDeepDirSync(path.dirname(dirPath))) {
      fs.mkdirSync(dirPath)
      return true
    }
  }
}

const isObject = (d) => {
  return Object.prototype.toString.call(d) === '[object Object]'
}

const objToArr = (obj) => {
  return Object.entries(obj).map(([key, value]) => {
    return {
      key,
      value
    }
  })
}

const compareLocaleData = async (oldFilePath, newFilePath) => {
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
  } catch (error) {
    throw new Error('文件比对-文件解析失败', error)
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

const formatString = (str) => {
  return str.replace(/[\n\r\t]/g, '').trim()
}

const cusJsonStringify = (obj) => {
  const formatObj = {}

  Object.entries(obj).forEach(([key, value]) => {
    formatObj[formatString(key)] = formatString(value)
  })

  return JSON.stringify(formatObj, Object.keys(formatObj).sort(), 2)
}

module.exports = {
  copyDir,
  makeDeepDirSync,
  isObject,
  compareLocaleData,
  cusJsonStringify
}
