import escapeStringRegexp from 'escape-string-regexp'

import type HtmlWebpackPlugin from 'html-webpack-plugin'
import type { Compiler } from 'webpack'

class InterpolateHtmlPlugin {
  private htmlWebpackPlugin: typeof HtmlWebpackPlugin
  private replacements: Record<string, string>

  constructor(
    htmlWebpackPlugin: typeof HtmlWebpackPlugin,
    replacements: Record<string, string>,
  ) {
    this.htmlWebpackPlugin = htmlWebpackPlugin
    this.replacements = replacements
  }

  apply(compiler: Compiler): void {
    compiler.hooks.compilation.tap('InterpolateHtmlPlugin', (compilation) => {
      this.htmlWebpackPlugin
        .getHooks(compilation)
        .afterTemplateExecution.tap('InterpolateHtmlPlugin', (data) => {
          // Run HTML through a series of user-specified string replacements.
          Object.keys(this.replacements).forEach((key) => {
            const value = this.replacements[key]
            data.html = data.html.replace(
              new RegExp('%' + escapeStringRegexp(key) + '%', 'g'),
              value,
            )
          })
          return data
        })
    })
  }
}

export default InterpolateHtmlPlugin
