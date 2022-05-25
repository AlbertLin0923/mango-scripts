import { deleteCodeComments } from '../utils/index'

// 从代码里提取中文字段
const regexExtractor = (code: string): Array<string> => {
  const regex =
    /[`"'][\u4e00-\u9fa5]([\u4e00-\u9fa5,.!?，。！？;:；：、~/（）\-——(){}<>\d\w\s])*[\u4e00-\u9fa5,.!?，。！？;:；：、~/（）\-——(){}<>\d\w][`"']/gm

  const formatCode = deleteCodeComments(code)

  let resultList: Array<string> = []

  if (formatCode !== null && formatCode !== '') {
    resultList = formatCode.match(regex) ?? []
  }
  if (resultList.length > 0) {
    resultList = resultList.map((item) => {
      return item.replace(/['"`]+$/, '').replace(/^['"`]+/, '')
    })
  }
  return resultList
}

export default regexExtractor
