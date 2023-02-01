import { describe, it, expect, test } from 'vitest'
const path = require('path')
const projectPath = path.resolve(__dirname, './demo')

import { extractChineseFieldList, Extractor } from '../../src/index'

describe('extract tsx', () => {
  test('should extract tsx i18n key', async () => {
    const result = await extractChineseFieldList(Extractor.AST, [projectPath], ['.tsx'])

    expect(result).toEqual(
      expect.arrayContaining([
        { 'zh-CN': '语言包', modules: 'DEMO模块' },
        { 'zh-CN': '总数目', modules: 'DEMO模块' },
        { 'zh-CN': '已翻译', modules: 'DEMO模块' },
        { 'zh-CN': '未翻译', modules: 'DEMO模块' },
        { 'zh-CN': '翻译进度', modules: 'DEMO模块' },
        { 'zh-CN': '数据统计', modules: 'DEMO模块' },
        { 'zh-CN': '刘德华', modules: 'DEMO模块' }
      ])
    )
  })

  test('should ignore console message i18n key', async () => {
    const result = await extractChineseFieldList(Extractor.AST, [projectPath], ['.tsx'])

    expect(result).toEqual(
      expect.not.arrayContaining([
        { 'zh-CN': '执行管理员设置', modules: 'DEMO模块' },
        { 'zh-CN': '开始管理员设置', modules: 'DEMO模块' }
      ])
    )
  })

  test('should ignore i18n key of translate-disable line', async () => {
    const result = await extractChineseFieldList(Extractor.AST, [projectPath], ['.tsx'])

    expect(result).toEqual(
      expect.not.arrayContaining([
        { 'zh-CN': '易烊千玺', modules: 'DEMO模块' },
        { 'zh-CN': '张杰', modules: 'DEMO模块' },
        { 'zh-CN': '周杰伦', modules: 'DEMO模块' },
        { 'zh-CN': '林俊杰', modules: 'DEMO模块' },
        { 'zh-CN': '王力宏', modules: 'DEMO模块' },
        { 'zh-CN': '林更新', modules: 'DEMO模块' }
      ])
    )
  })
})
