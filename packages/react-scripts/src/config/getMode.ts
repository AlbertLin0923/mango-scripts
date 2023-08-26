const defaultDevelopmentNodeEnvMode = {
  NODE_ENV: 'development',
  BABEL_ENV: 'development',

  USE_HTTPS: 'false',
  SSL_CRT_FILE_PATH: '',
  SSL_KEY_FILE_PATH: '',
  USE_TAILWIND: 'false',
  USE_FAST_REFRESH: 'true',
  USE_MFSU: 'false',
  IMAGE_INLINE_SIZE_LIMIT: '10000',
  USE_ESLINT_PLUGIN: 'true',

  PORT: '',
  WDS_SOCKET_HOST: '',
  WDS_SOCKET_PATH: '',
  WDS_SOCKET_PORT: ''
}

const defaultProductionNodeEnvMode = {
  NODE_ENV: 'production',
  BABEL_ENV: 'production',

  USE_JS_MINIMIZER: 'terserMinify', // terserMinify | uglifyJsMinify | esbuildMinify | swcMinify
  USE_CSS_MINIMIZER: 'cssnanoMinify', // cssnanoMinify | esbuildMinify | swcMinify | lightningCssMinify

  USE_ESLINT_PLUGIN: 'true',
  USE_STYLELINT_PLUGIN: 'true',

  USE_PROFILE: 'false',
  USE_TAILWIND: 'false',
  IMAGE_INLINE_SIZE_LIMIT: '10000',
  EMIT_ESLINT_ERRORS_AS_WARNINGS: 'false',
  DIST_PATH: 'dist',

  USE_ANALYZE: 'false',

  DROP_CONSOLE: 'false',
  DROP_DEBUGGER: 'false'
}

export type DefaultModeType = {
  local: Record<string, string>
  dev: Record<string, string>
  test: Record<string, string>
  stage: Record<string, string>
  prod: Record<string, string>
}

export const defaultMode: DefaultModeType = {
  local: {
    ...defaultDevelopmentNodeEnvMode,
    REACT_APP_ENV: 'local'
  },
  dev: {
    ...defaultProductionNodeEnvMode,
    REACT_APP_ENV: 'dev',
    USE_SOURCEMAP: 'true'
  },
  test: {
    ...defaultProductionNodeEnvMode,
    REACT_APP_ENV: 'test',
    USE_SOURCEMAP: 'true'
  },
  stage: {
    ...defaultProductionNodeEnvMode,
    REACT_APP_ENV: 'stage',
    USE_SOURCEMAP: 'false'
  },
  prod: {
    ...defaultProductionNodeEnvMode,
    REACT_APP_ENV: 'prod',
    USE_SOURCEMAP: 'false'
  }
}
