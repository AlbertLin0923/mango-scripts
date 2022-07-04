const path = require('path')
const projectPath = path.resolve(__dirname, './demo')

import { extractChineseFieldList, Extractor } from '../../src/index'

describe('extract vue sfc', () => {
  test('should extract template i18n key', async () => {
    const result = await extractChineseFieldList(Extractor.AST, [projectPath], ['.vue'])
    expect(result).toContainEqual({ 'zh-CN': '返回', modules: 'DEMO模块' })
    expect(result).toContainEqual({ 'zh-CN': '序号', modules: 'DEMO模块' })
  })

  test('should extract scripts i18n key', async () => {
    const result = await extractChineseFieldList(Extractor.AST, [projectPath], ['.vue'])
    expect(result).toContainEqual({ 'zh-CN': '列表页', modules: 'DEMO模块' })
    expect(result).toContainEqual({ 'zh-CN': '历史记录', modules: 'DEMO模块' })
    expect(result).toContainEqual({ 'zh-CN': '详情页', modules: 'DEMO模块' })
    expect(result).toContainEqual({ 'zh-CN': '排查系统', modules: 'DEMO模块' })
  })
})
