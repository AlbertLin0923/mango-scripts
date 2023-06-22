const defaultDevelopmentNodeEnvMode = {
  NODE_ENV: 'development',
  BABEL_ENV: 'development',

  REACT_APP_ENV: 'dev',
  USE_HTTPS: 'false',
  SSL_CRT_FILE_PATH: '',
  SSL_KEY_FILE_PATH: '',
  USE_TAILWIND: 'false',
  USE_FAST_REFRESH: 'true',
  USE_MFSU: 'false',
  IMAGE_INLINE_SIZE_LIMIT: '10000',
  USE_ESLINT_PLUGIN: 'false',

  PORT: '',
  WDS_SOCKET_HOST: '',
  WDS_SOCKET_PATH: '',
  WDS_SOCKET_PORT: ''
}

const defaultProductionNodeEnvMode = {
  NODE_ENV: 'production',
  BABEL_ENV: 'production',

  REACT_APP_ENV: 'prod',
  USE_ESBUILD: 'false',
  USE_SWC: 'false',
  USE_UGLIFY: 'false',
  USE_PROFILE: 'false',
  USE_SOURCEMAP: 'false',
  USE_TAILWIND: 'false',
  IMAGE_INLINE_SIZE_LIMIT: '10000',
  EMIT_ESLINT_ERRORS_AS_WARNINGS: 'false',
  USE_ESLINT_PLUGIN: 'false',
  USE_ANALYZE: 'false'
}

export type DefaultModeType = {
  dev: Record<string, string>
  test: Record<string, string>
  stage: Record<string, string>
  prod: Record<string, string>
}

export const defaultMode: DefaultModeType = {
  dev: {
    ...defaultDevelopmentNodeEnvMode
  },
  test: {
    ...defaultProductionNodeEnvMode,
    REACT_APP_ENV: 'test',
    USE_SOURCEMAP: 'true'
  },
  stage: {
    ...defaultProductionNodeEnvMode,
    REACT_APP_ENV: 'stage'
  },
  prod: {
    ...defaultProductionNodeEnvMode,
    REACT_APP_ENV: 'prod'
  }
}
