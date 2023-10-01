import { describe, expect, test } from 'vitest'

import { extractChineseFieldList } from '../../src/index'
const path = require('path')
const projectPath = path.resolve(__dirname, './demo')

describe('extract vue sfc', () => {
  test('should extract template i18n key', async () => {
    const result = await extractChineseFieldList('ast', [projectPath], ['.vue'])
    expect(result).toEqual(
      expect.arrayContaining([
        { 'zh-CN': '返回', modules: 'DEMO模块' },
        { 'zh-CN': '序号', modules: 'DEMO模块' },
      ]),
    )
  })

  test('should extract scripts i18n key', async () => {
    const result = await extractChineseFieldList('ast', [projectPath], ['.vue'])
    expect(result).toEqual(
      expect.arrayContaining([
        { 'zh-CN': '列表页', modules: 'DEMO模块' },
        { 'zh-CN': '页面数据', modules: 'DEMO模块' },
        { 'zh-CN': '历史记录', modules: 'DEMO模块' },
        { 'zh-CN': '详情页', modules: 'DEMO模块' },
        { 'zh-CN': '排查系统', modules: 'DEMO模块' },
        { 'zh-CN': '刘德华', modules: 'DEMO模块' },
      ]),
    )
  })

  test('should ignore console message i18n key', async () => {
    const result = await extractChineseFieldList('ast', [projectPath], ['.vue'])

    expect(result).toEqual(
      expect.not.arrayContaining([
        { 'zh-CN': '输出列表数据', modules: 'DEMO模块' },
      ]),
    )
  })

  test('should ignore i18n key of translate-disable line', async () => {
    const result = await extractChineseFieldList('ast', [projectPath], ['.vue'])

    expect(result).toEqual(
      expect.not.arrayContaining([
        { 'zh-CN': '易烊千玺', modules: 'DEMO模块' },
        { 'zh-CN': '张杰', modules: 'DEMO模块' },
        { 'zh-CN': '周杰伦', modules: 'DEMO模块' },
        { 'zh-CN': '林俊杰', modules: 'DEMO模块' },
        { 'zh-CN': '王力宏', modules: 'DEMO模块' },
        { 'zh-CN': '林更新', modules: 'DEMO模块' },
      ]),
    )
  })
})
