import { declare } from '@babel/helper-plugin-utils'

import type { BabelAPI } from '@babel/helper-plugin-utils'
import type { PluginPass, BabelFile, types as t } from '@babel/core'
import type { NodePath } from '@babel/traverse'
import type { Identifier, ImportDeclaration, JSXAttribute } from '@babel/types'

export default declare(
  (api: BabelAPI, options: Record<string, any>, dirname: string) => {
    api.assertVersion(7)
    return {
      name: 'auto-react-css-modules',
      pre(this: PluginPass, file: BabelFile) {},
      visitor: {
        Program: {
          enter(path, state) {
            const styleImports: ImportDeclaration[] = []
            let lastImportDeclarationPath: NodePath<ImportDeclaration> | null =
              null
            path.traverse({
              ImportDeclaration(p: NodePath<t.ImportDeclaration>) {
                const source = p.node.source.value
                if (/\.(css|sass|scss|less|styl|stylus)$/.test(source)) {
                  styleImports.push(p.node)
                  lastImportDeclarationPath = p
                }
              },
            })
            if (styleImports.length === 0) {
              return
            }

            const defaultStyleImports = styleImports.map((node) => {
              const existingDefaultSpecifier = node.specifiers.find((node) =>
                api.types.isImportDefaultSpecifier(node),
              )
              if (existingDefaultSpecifier) {
                return existingDefaultSpecifier.local
              }

              const generateDefaultStyleImport =
                path.scope.generateUidIdentifier('style')
              node.specifiers.push(
                api.types.importDefaultSpecifier(generateDefaultStyleImport),
              )
              return generateDefaultStyleImport
            })

            const mergedStyle = path.scope.generateUidIdentifier('styles')
            const getMatcher = path.scope.generateUidIdentifier('getMatcher')
            const matcher = path.scope.generateUidIdentifier('matcher')

            const helperImport = api.template.ast(`import ${
              getMatcher.name
            } from 'babel-plugin-jsx-css-modules/helpers';
              const ${
                mergedStyle.name
              } = Object.assign({}, ${defaultStyleImports
                .map((node) => node.name)
                .join(', ')});
            const ${matcher.name} = ${getMatcher.name}(${
              mergedStyle.name
            }, 'local');
          `)

            lastImportDeclarationPath!.insertAfter(helperImport)

            state.set('matcher', matcher)
          },
        },
        JSXAttribute(path: NodePath<t.JSXAttribute>, state: PluginPass) {
          if (path.node.name.name !== 'className') {
            return
          }

          // path.node.value = api.types.jSXExpressionContainer(
          //   api.template.ast(`${state.get('matcher')}(${path.node.value})`)
          //     ?.expression,
          // )
          path.node.value = api.types.jSXExpressionContainer(
            api.types.callExpression(state.get('matcher'), [
              api.types.isExpression(path.node.value)
                ? path.node.value.expression
                : api.types.isStringLiteral(path.node.value)
                  ? api.types.stringLiteral(path.node.value?.value)
                  : api.types.stringLiteral(path.node.value?.value),
            ]),
          )
        },
      },
      post(this: PluginPass, file: BabelFile) {},
    }
  },
)
