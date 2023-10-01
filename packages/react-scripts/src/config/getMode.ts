export type CliEnvType = {
  development: Record<string, string>
  production: Record<string, string>
}

export type RecommendProductionEnvType = {
  dev: Record<string, string>
  test: Record<string, string>
  stage: Record<string, string>
  prod: Record<string, string>
}

export const cliEnv: CliEnvType = {
  development: {
    NODE_ENV: 'development',
    BABEL_ENV: 'development',

    USE_TAILWIND: 'false',
    USE_HTTPS: 'false',
    SSL_CRT_FILE_PATH: '',
    SSL_KEY_FILE_PATH: '',
    PORT: '',
    WDS_SOCKET_HOST: '',
    WDS_SOCKET_PATH: '',
    WDS_SOCKET_PORT: '',
    USE_LOCAL_HOST: 'false',

    REACT_APP_ENV: 'development',
  },
  production: {
    NODE_ENV: 'production',
    BABEL_ENV: 'production',

    USE_TAILWIND: 'false',
    USE_PROFILE: 'false',
    USE_ANALYZE: 'false',
    USE_SOURCEMAP: 'false',
    DROP_CONSOLE: 'false',
    DROP_DEBUGGER: 'false',

    REACT_APP_ENV: 'production',
  },
}

export const recommendProductionEnv: RecommendProductionEnvType = {
  dev: {
    ...cliEnv['production'],
    REACT_APP_ENV: 'dev',
    USE_SOURCEMAP: 'true',
  },
  test: {
    ...cliEnv['production'],
    REACT_APP_ENV: 'test',
    USE_SOURCEMAP: 'true',
  },
  stage: {
    ...cliEnv['production'],
    REACT_APP_ENV: 'stage',
    USE_SOURCEMAP: 'false',
    DROP_CONSOLE: 'true',
    DROP_DEBUGGER: 'true',
  },
  prod: {
    ...cliEnv['production'],
    REACT_APP_ENV: 'prod',
    USE_SOURCEMAP: 'false',
    DROP_CONSOLE: 'true',
    DROP_DEBUGGER: 'true',
  },
}
