import * as compilerVue from 'vue-template-compiler'
import * as babel from '@babel/core'
import * as babelParser from '@babel/parser'
import * as t from '@babel/types'
import * as pug from 'pug'
import * as compilerSvelte from 'svelte/compiler'
import * as hyntax from 'hyntax'

import { collectDisableRuleCommentlocation, inDisableRuleCommentlocation } from '../utils/index'

// ------------------------vue-------------------------------
const MATCH_I18N_FUNC_REGEX = /(?<=\$t\()([\w\W]*?)(?=\))/g

const MATCH_STRING_CONTENT = /(?<=['"`])(.*?)(?=['"`])/g

const INCLUDE_CHINESE_CHAR = /.*[\u4e00-\u9fa5]+.*$/

// -----------------------------vue start--------------------------------------

const extractInTemplateOfVue = (templateContent: string): string[] => {
  const { tokens } = hyntax.tokenize(templateContent)
  const templateAst = hyntax.constructTree(tokens)?.ast

  const arr: any = []

  function formatI18nFuncMatcherList(list: string[]): string[] {
    const result: string[] = []
    list.forEach((i) => {
      const r = i.match(MATCH_STRING_CONTENT)
      if (r) {
        result.push(...r)
      }
    })
    return result
  }

  function collectChineseOfAttributes(ast: any) {
    ast?.content?.attributes?.length &&
      ast.content.attributes.forEach((item: any) => {
        const i18nFuncmatcherList = item?.value?.content?.trim().match(MATCH_I18N_FUNC_REGEX)
        if (i18nFuncmatcherList) {
          const i18nStrmatcherList = formatI18nFuncMatcherList(i18nFuncmatcherList)
          arr.push(...i18nStrmatcherList)
        }
      })
  }

  function emun(ast: any) {
    if (!ast?.content?.children) {
      const textContent = ast.content?.value?.content
      if (textContent) {
        const i18nFuncmatcherList = textContent.trim().match(MATCH_I18N_FUNC_REGEX)

        if (i18nFuncmatcherList) {
          const i18nStrmatcherList = formatI18nFuncMatcherList(i18nFuncmatcherList)
          arr.push(...i18nStrmatcherList)
        }
      }
      collectChineseOfAttributes(ast)
    } else {
      collectChineseOfAttributes(ast)
      ast?.content?.children?.forEach((item: any) => {
        emun(item)
      })
    }
  }

  templateAst && emun(templateAst)

  return arr
}

const extractInVue = (code: string): string[] => {
  const sfc: compilerVue.SFCDescriptor = compilerVue.parseComponent(code)

  const { template, script } = sfc

  let templateTextArr: string[] = []
  let scriptTextArr: string[] = []

  if (template) {
    const templateContent = (template.content ??= '')
    const formatTemplateContent =
      template.lang && template.lang === 'pug'
        ? pug.compile(templateContent, {
            doctype: 'html'
          })()
        : templateContent
    templateTextArr = extractInTemplateOfVue(formatTemplateContent)
  }

  if (script) {
    const scriptContent = (script.content ??= '')
    scriptTextArr = extractInJsAndTs(scriptContent)
  }

  return [...templateTextArr, ...scriptTextArr]
}

// -----------------------------vue end------------------------------------

// -----------------------------svelte start------------------------------------

const extractInHtmlOfSvelte = (templateAst: any): string[] => {
  const arr: string[] = []
  function emun(ast: any) {
    if (!ast.children) {
      if (ast.data) {
        const t = ast.data.match(INCLUDE_CHINESE_CHAR)
        t ? arr.push(...t) : ''
      }
    } else {
      ast.attributes &&
        ast.attributes.length > 0 &&
        ast.attributes.forEach((attrItem: any) => {
          attrItem.value &&
            attrItem.value.length > 0 &&
            attrItem.value.forEach((it: any) => {
              const t = it.data.match(INCLUDE_CHINESE_CHAR)
              if (t) {
                arr.push(...t)
              }
            })
        })

      ast.children &&
        ast.children.forEach((item: any) => {
          emun(item)
        })
    }
  }
  emun(templateAst)
  return arr
}

const extractInSvelte = (code: string): string[] => {
  const sfc = compilerSvelte.compile(code, {
    // options
  })
  const {
    ast: { html: templateAst }
  } = sfc
  const scriptContent = sfc.js

  let templateTextArr: string[] = []
  let scriptTextArr: string[] = []

  if (templateAst) {
    templateTextArr = extractInHtmlOfSvelte(templateAst)
  }

  if (scriptContent) {
    scriptTextArr = extractInJsAndTs(scriptContent)
  }

  return [...templateTextArr, ...scriptTextArr]
}
// -----------------------------svelte end------------------------------------

// ------------------------------- js & ts start------------------------------------

const extractInJsAndTs = (code: string): string[] => {
  const ast = babelParser.parse(code, {
    sourceType: 'unambiguous',
    plugins: ['jsx', 'typescript']
  })

  const arr: string[] = []

  const { entireFileDisabled, partialCommentList, nextLineCommentList, thisLineCommentList } =
    collectDisableRuleCommentlocation(ast.comments)

  const _inDisableRuleCommentlocation = (startLine: number, endLine: number) => {
    return inDisableRuleCommentlocation(
      entireFileDisabled,
      partialCommentList,
      nextLineCommentList,
      thisLineCommentList,
      startLine,
      endLine
    )
  }

  const visitor = {
    Program: {
      enter(path: any) {
        path.traverse({
          'StringLiteral|TemplateLiteral|JSXText'(path: any) {
            const startLine = path.node.loc.start.line
            const endLine = path.node.loc.end.line

            if (_inDisableRuleCommentlocation(startLine, endLine)) {
              path.node.skipTransform = true
            }
            if (
              path.findParent((p: any) => {
                return p.node.callee && t.isIdentifier(p.node.callee.object, { name: 'console' })
              })
            ) {
              path.node.skipTransform = true
            }
          }
        })
      }
    },
    StringLiteral(path: any) {
      if (path.node.skipTransform) {
        return
      }
      const value = path.node.value
      if (INCLUDE_CHINESE_CHAR.test(value)) {
        arr.push(value)
      }
    },
    TemplateLiteral(path: any) {
      if (path.node.skipTransform) {
        return
      }
      path.get('quasis').forEach((templateElementPath: any) => {
        const value = templateElementPath.node.value.raw
        if (value && INCLUDE_CHINESE_CHAR.test(value)) {
          arr.push(value)
        }
      })
    },
    JSXText(path: any) {
      if (path.node.skipTransform) {
        return
      }
      const value = path.node.value

      if (INCLUDE_CHINESE_CHAR.test(value)) {
        arr.push(value)
      }
    }
  }

  const i18nPlugin = { visitor }

  babel.transformFromAstSync(ast, code, {
    presets: null,
    plugins: [[i18nPlugin]]
  })

  return arr
}

// ------------------------------- js & ts end------------------------------------

const astExtractor = (code: string, filePath: string) => {
  if (filePath.endsWith('.vue')) {
    return extractInVue(code)
  } else if (filePath.endsWith('.svelte')) {
    return extractInSvelte(code)
  } else if (
    filePath.endsWith('.tsx') ||
    filePath.endsWith('.ts') ||
    filePath.endsWith('.jsx') ||
    filePath.endsWith('.js')
  ) {
    return extractInJsAndTs(code)
  } else {
    return []
  }
}

export default astExtractor
