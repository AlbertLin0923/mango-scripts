import { deleteCodeComments } from '../utils/index.ts'

export const regexExtractor = (code: string): string[] => {
  const regex =
    /[`"'][\u4e00-\u9fa5]([\u4e00-\u9fa5,.!?，。！？;:；：、~/（）\-——(){}<>\d\w\s])*[\u4e00-\u9fa5,.!?，。！？;:；：、~/（）\-——(){}<>\d\w][`"']/gm

  const formatCode = deleteCodeComments(code)

  let resultList: string[] = []

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
