import { isString } from 'lodash-es'

import type { Compiler, Compilation } from 'webpack'
import type HtmlWebpackPlugin from 'html-webpack-plugin'

class InlineChunkHtmlPlugin {
  private htmlWebpackPlugin: typeof HtmlWebpackPlugin
  private tests: RegExp[]

  constructor(htmlWebpackPlugin: typeof HtmlWebpackPlugin, tests: RegExp[]) {
    this.htmlWebpackPlugin = htmlWebpackPlugin
    this.tests = tests
  }

  /**
   * Get the inlined tag based on the specified conditions.
   * @param publicPath - The public path used in the project.
   * @param assets - Compilation assets.
   * @param tag - The HTML tag to be processed.
   * @returns The modified HTML tag.
   */
  private getInlinedTag(
    publicPath: string,
    assets: Record<string, any>,
    tag: HtmlWebpackPlugin.HtmlTagObject,
  ): HtmlWebpackPlugin.HtmlTagObject {
    // Check if the tag is a script tag with a valid source attribute.
    if (tag.tagName !== 'script') {
      return tag
    }

    if (!tag?.attributes?.src || !isString(tag?.attributes?.src)) {
      return tag
    }

    // Extract the script name from the source attribute.
    const scriptName = publicPath
      ? tag.attributes.src.replace(publicPath, '')
      : tag.attributes.src

    // Check if the script name matches any of the specified tests.
    if (!this.tests.some((test) => scriptName.match(test))) {
      return tag
    }

    // Retrieve the asset corresponding to the script name.
    const asset = assets[scriptName]

    // If the asset is not found, return the original tag.
    if (asset == null) {
      return tag
    }

    // Return an inlined script tag with the asset's source code.
    return {
      tagName: 'script',
      innerHTML: asset.source(),
      attributes: {},
      voidTag: false,
      meta: {},
    }
  }

  /**
   * Apply the plugin to the Webpack compiler.
   * @param compiler - The Webpack compiler instance.
   */
  public apply(compiler: Compiler): void {
    let publicPath = (compiler.options.output.publicPath || '') as string

    // Ensure that the public path ends with a slash.
    if (publicPath && !publicPath.endsWith('/')) {
      publicPath += '/'
    }

    // Tap into the compilation hook to modify asset tags.
    compiler.hooks.compilation.tap(
      'InlineChunkHtmlPlugin',
      (compilation: Compilation) => {
        // Function to process individual tags.
        const tagFunction = (tag: HtmlWebpackPlugin.HtmlTagObject) =>
          this.getInlinedTag(publicPath, compilation.assets, tag)

        // Get HtmlWebpackPlugin hooks.
        const hooks = this.htmlWebpackPlugin.getHooks(compilation)

        // Tap into the alterAssetTagGroups hook to modify head and body tags.
        hooks.alterAssetTagGroups.tap('InlineChunkHtmlPlugin', (assets) => {
          assets.headTags = assets.headTags.map(tagFunction)
          assets.bodyTags = assets.bodyTags.map(tagFunction)

          return assets
        })

        // Still emit the runtime chunk for users who do not use our generated
        // index.html file.
        hooks.afterEmit.tap('InlineChunkHtmlPlugin', (assets) => {
          Object.keys(compilation.assets).forEach((assetName) => {
            if (this.tests.some((test) => assetName.match(test))) {
              delete compilation.assets[assetName]
            }
          })

          return assets
        })
      },
    )
  }
}

export default InlineChunkHtmlPlugin
