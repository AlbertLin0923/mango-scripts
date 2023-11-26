import type { MinifyOptions } from 'terser'

export type ConfigType = {
  /**
   * output directory
   * @type {string}
   * @default dist
   */
  distDir?: string

  /**
   * loader config
   */
  loader?: {
    babel?: {
      options: Record<string, any>
    }
    less?: {
      options: Record<string, any>
    }
    sass?: {
      options: Record<string, any>
    }
    stylus?: {
      options: Record<string, any>
    }
    postcss?: {
      options: Record<string, any>
    }
  }

  /**
   * plugin config
   */
  plugin?: {
    /**
     * eslint-webpack-plugin config
     */
    eslint?: {
      /**
       * enable eslint
       * @default true
       */
      enable: boolean
      options?: Record<string, any>
    }
    /**
     * stylelint-webpack-plugin config
     */
    stylelint?: {
      /**
       * enable eslint
       * @default true
       */
      enable: true
      options?: Record<string, any>
    }
    /**
     *   react-dev-utils/ForkTsCheckerWebpackPlugin config
     */
    typescript?: {
      /**
       * enable eslint
       * @default true
       */
      enable: true
      options?: Record<string, any>
    }
  }

  /**
   * webpack optimization config
   */
  optimization?: {
    /**
     * webpack optimization config
     */
    splitChunks?: any
    /**
     * webpack minimizer config
     */
    minimizer?: {
      /**
       * jsMinimizer config
       */
      jsMinimizer?: {
        /**
         * minify
         * @default 'terserMinify'
         */
        minify:
          | 'terserMinify'
          | 'uglifyJsMinify'
          | 'esbuildMinify'
          | 'swcMinify'
        terserOptions?: MinifyOptions
      }
      /**
       * cssMinimizer config
       */
      cssMinimizer?: {
        /**
         * minify
         * @default 'cssnanoMinify'
         */
        minify:
          | 'cssnanoMinify'
          | 'cssoMinify'
          | 'cleanCssMinify'
          | 'esbuildMinify'
          | 'lightningCssMinify'
          | 'swcMinify'
        minimizerOptions?: Record<string, any>
      }
    }
  }
}

export function defineConfig(config: ConfigType): ConfigType {
  return config
}
