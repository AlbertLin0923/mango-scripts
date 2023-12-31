import type { MinifyOptions } from 'terser'
import type { Options as SwcOptions } from '@swc/core'
import type { TransformOptions as EsbuildOptions } from 'esbuild'
import type { ServerOptions } from 'https'
import type { RsbuildConfig } from '@rsbuild/core'

export type UserConfigType = {
  /**
   * output directory
   * @type {string}
   * @default dist
   */
  distDir: string

  /**
   * loader config
   */
  loader: {
    babel: {
      /**
       * enable
       * @default true
       */
      enable: boolean
      options: Record<string, any>
    }
    less: {
      /**
       * enable
       * @default true
       */
      enable: boolean
      options: Record<string, any>
    }
    sass: {
      /**
       * enable
       * @default true
       */
      enable: boolean
      options: Record<string, any>
    }
    stylus: {
      /**
       * enable
       * @default true
       */
      enable: boolean
      options: Record<string, any>
    }
    postcss: {
      /**
       * enable
       * @default true
       */
      enable: boolean
      options: Record<string, any>
    }
    swc: {
      /**
       * enable
       * @default false
       */
      enable: boolean
      options: SwcOptions
    }
    esbuild: {
      /**
       * enable
       * @default false
       */
      enable: boolean
      options: EsbuildOptions
    }
  }

  /**
   * plugin config
   */
  plugin: {
    /**
     * eslint-webpack-plugin config
     */
    eslint: {
      /**
       * enable
       * @default true
       */
      enable: boolean
      options: Record<string, any>
    }
    /**
     * stylelint-webpack-plugin config
     */
    stylelint: {
      /**
       * enable
       * @default true
       */
      enable: boolean
      options: Record<string, any>
    }
    /**
     * fork-ts-checker-webpack-plugin config
     */
    typescript: {
      /**
       * enable
       * @default true
       */
      enable: boolean
      options: Record<string, any>
    }
  }

  /**
   * webpack optimization config
   */
  optimization: {
    /**
     * webpack optimization config
     */
    splitChunks: any
    /**
     * webpack minimizer config
     */
    minimizer: {
      /**
       * jsMinimizer config
       */
      jsMinimizer: {
        /**
         * minify
         * @default 'terserMinify'
         */
        minify:
          | 'terserMinify'
          | 'uglifyJsMinify'
          | 'esbuildMinify'
          | 'swcMinify'
        terserOptions: MinifyOptions
      }
      /**
       * cssMinimizer config
       */
      cssMinimizer: {
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
        minimizerOptions: Record<string, any>
      }
    }
  }

  /**
   * webpack server config
   */
  server: {
    /**
     * https config
     * @default undefined
     */
    https: ServerOptions | undefined
  }
}

type WebpackConfig = {
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
      /**
       * enable
       * @default true
       */
      enable: boolean
      options?: Record<string, any>
    }
    less?: {
      /**
       * enable
       * @default true
       */
      enable: boolean
      options?: Record<string, any>
    }
    sass?: {
      /**
       * enable
       * @default true
       */
      enable: boolean
      options?: Record<string, any>
    }
    stylus?: {
      /**
       * enable
       * @default true
       */
      enable: boolean
      options?: Record<string, any>
    }
    postcss?: {
      /**
       * enable
       * @default true
       */
      enable: boolean
      options?: Record<string, any>
    }
    swc?: {
      /**
       * enable
       * @default false
       */
      enable: boolean
      options?: SwcOptions
    }
    esbuild?: {
      /**
       * enable
       * @default false
       */
      enable: boolean
      options?: EsbuildOptions
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
       * enable
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
       * enable
       * @default true
       */
      enable: boolean
      options?: Record<string, any>
    }
    /**
     * fork-ts-checker-webpack-plugin config
     */
    typescript?: {
      /**
       * enable
       * @default true
       */
      enable: boolean
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

  /**
   * webpack server config
   */
  server?: {
    /**
     * https config
     * @default undefined
     */
    https: ServerOptions | undefined
  }
}

export const userDefaultWebpackConfig: WebpackConfig = {
  distDir: 'dist',
  loader: {
    babel: {
      enable: true,
      options: {},
    },
    less: {
      enable: true,
      options: {},
    },
    sass: {
      enable: true,
      options: {},
    },
    stylus: {
      enable: true,
      options: {},
    },
    postcss: {
      enable: true,
      options: {},
    },
    swc: {
      enable: false,
      options: {},
    },
    esbuild: {
      enable: false,
      options: {},
    },
  },
  plugin: {
    eslint: {
      enable: true,
      options: {},
    },
    stylelint: {
      enable: true,
      options: {},
    },
    typescript: {
      enable: true,
      options: {},
    },
  },
  optimization: {
    splitChunks: {},
    minimizer: {
      jsMinimizer: {
        minify: 'terserMinify',
        terserOptions: {},
      },
      cssMinimizer: {
        minify: 'cssnanoMinify',
        minimizerOptions: {},
      },
    },
  },
  server: {
    https: undefined,
  },
}

export function defineConfig(
  config: WebpackConfig | RsbuildConfig,
): WebpackConfig | RsbuildConfig {
  return config
}
