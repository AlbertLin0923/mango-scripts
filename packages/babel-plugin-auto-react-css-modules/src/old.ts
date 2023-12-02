const defaultPrefer = 'local'
const defaultStyleFileReg = [/\.(css|scss|sass|less)$/]

module.exports = function ({ types: t, template }) {
  const classNameDecorator = {
    JSXAttribute: {
      enter(path) {
        if (path.node.name.name !== 'className') {
          return
        }
        path.node.value = t.jSXExpressionContainer(
          t.callExpression(this.matcher, [
            path.node.value.expression ||
              t.stringLiteral(path.node.value.value),
          ]),
        )
      },
    },
  }

  return {
    visitor: {
      Program: {
        enter(
          path,
          {
            opts: {
              prefer = defaultPrefer,
              styleFileReg = defaultStyleFileReg,
              helperImportType = 'cjs',
            },
          },
        ) {
          // 初始化检测样式文件的正则表达式
          styleFileReg = styleFileReg
            .map((reg) => {
              if (Object.prototype.toString.call(reg) === '[object RegExp]') {
                return reg
              }

              if (typeof reg === 'string') {
                return new RegExp(reg)
              }

              return undefined
            })
            .filter((reg) => !!reg)

          // 筛出样式文件的引入语句，若无样式导入则不执行余下步骤
          const styleImports = path.node.body.filter(
            (node) =>
              t.isImportDeclaration(node) &&
              styleFileReg.some((reg) => reg.test(node.source.value)),
          )
          if (styleImports.length === 0) {
            return
          }

          // 汇总出样式引入的默认导出名，若无默认导出则自动添加
          const defaultStyles = styleImports.map((node) => {
            const existingDefaultSpecifier = node.specifiers.find((node) =>
              t.isImportDefaultSpecifier(node),
            )
            if (existingDefaultSpecifier) {
              return existingDefaultSpecifier.local
            }

            const defaultStyle = path.scope.generateUidIdentifier('style')
            node.specifiers.push(t.importDefaultSpecifier(defaultStyle))
            return defaultStyle
          })

          // 合并样式引入的默认导出，并在最后一条样式引入后增加辅助代码
          const mergedStyle = path.scope.generateUidIdentifier('styles')
          const getMatcher = path.scope.generateUidIdentifier('getMatcher')
          const matcher = path.scope.generateUidIdentifier('matcher')

          const lastStyleImportDeclaration =
            styleImports[styleImports.length - 1]
          const lastStyleImportDeclarationPath = path.get(
            `body.${path.node.body.indexOf(lastStyleImportDeclaration)}`,
          )
          lastStyleImportDeclarationPath.insertAfter(
            template(`
              ${
                {
                  cjs: `const ${getMatcher.name} = require('babel-plugin-jsx-css-modules/helpers').getMatcher;`,
                  esm: `import { getMatcher as ${getMatcher.name} } from 'babel-plugin-jsx-css-modules/helpers';`,
                }[helperImportType] || ''
              }
              const ${mergedStyle.name} = Object.assign({}, ${defaultStyles
                .map((node) => node.name)
                .join(', ')});
              const ${matcher.name} = ${getMatcher.name}(${
                mergedStyle.name
              }, '${prefer}');
            `)(),
          )

          // 遍历替换文件中的 className
          path.traverse(classNameDecorator, {
            matcher,
          })
        },
      },
    },
  }
}
