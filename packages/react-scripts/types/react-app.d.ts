/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test'
    readonly PUBLIC_URL: string
  }
}

declare module '*.avif' {
  const src: string
  export default src
}

declare module '*.bmp' {
  const src: string
  export default src
}

declare module '*.gif' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.jpeg' {
  const src: string
  export default src
}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.webp' {
  const src: string
  export default src
}

declare module '*.svg' {
  import type * as React from 'react'

  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >

  const src: string
  export default src
}

declare module '*.module.css' {
  const classes: Readonly<Record<string, string>>
  export default classes
}

declare module '*.module.less' {
  const classes: Readonly<Record<string, string>>
  export default classes
}

declare module '*.module.scss' {
  const classes: Readonly<Record<string, string>>
  export default classes
}

declare module '*.module.sass' {
  const classes: Readonly<Record<string, string>>
  export default classes
}

declare module '*.module.stylus' {
  const classes: Readonly<Record<string, string>>
  export default classes
}

declare module '*.module.styl' {
  const classes: Readonly<Record<string, string>>
  export default classes
}

declare module 'bfj'

declare module 'react-dev-utils/clearConsole'
declare module 'react-dev-utils/checkRequiredFiles'
declare module 'react-dev-utils/WebpackDevServerUtils'
declare module 'react-dev-utils/openBrowser'
declare module 'react-dev-utils/browsersHelper'
declare module 'react-dev-utils/evalSourceMapMiddleware'
declare module 'react-dev-utils/noopServiceWorkerMiddleware'
declare module 'react-dev-utils/ignoredFiles'
declare module 'react-dev-utils/redirectServedPathMiddleware'
declare module 'react-dev-utils/InterpolateHtmlPlugin'
declare module 'react-dev-utils/InlineChunkHtmlPlugin'
declare module 'react-dev-utils/ForkTsCheckerWebpackPlugin'
declare module 'react-dev-utils/ModuleNotFoundPlugin'
declare module 'react-dev-utils/ModuleScopePlugin'
declare module 'react-dev-utils/formatWebpackMessages'
declare module 'react-dev-utils/FileSizeReporter'
declare module 'react-dev-utils/printBuildError'
declare module 'react-dev-utils/getPublicUrlOrPath'
declare module 'react-dev-utils/getCacheIdentifier'
declare module 'react-dev-utils/getCSSModuleLocalIdent'

// declare module 'react-dev-utils/ModuleNotFoundPlugin'

// declare module 'react-dev-utils/ForkTsCheckerWebpackPlugin'

// declare module 'react-dev-utils/WebpackDevServerUtils'
