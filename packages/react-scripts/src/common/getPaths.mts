import path from 'node:path'

import { fs } from '@mango-scripts/utils'

import getPublicUrlOrPath from '../common/utils/getPublicUrlOrPath.mjs'

import type { UserConfigType } from '../defineConfig.mjs'

export const getPaths = (userConfig: UserConfigType) => {
  // Make sure any symlinks in the project folder are resolved:
  // https://github.com/facebook/create-react-app/issues/637
  const appDirectory = fs.realpathSync(process.cwd())
  const resolveApp = (relativePath: string) =>
    path.resolve(appDirectory, relativePath)

  // We use `PUBLIC_URL` environment variable or "homepage" field to infer
  // "public path" at which the app is served.
  // webpack needs to know it to put the right <script> hrefs into HTML even in
  // single-page apps that may serve index.html for nested URLs like /todos/42.
  // We can't use a relative path in HTML because we don't want to load something
  // like /todos/42/static/js/bundle.7289d.js. We have to know the root.
  const publicUrlOrPath = getPublicUrlOrPath(
    process.env.NODE_ENV === 'development',
    fs.readJSONSync(resolveApp('package.json'))?.homepage,
    process.env.PUBLIC_URL,
  )

  const { distDir } = userConfig

  const moduleFileExtensions = [
    'web.mjs',
    'mjs',
    'web.js',
    'js',
    'web.ts',
    'ts',
    'web.tsx',
    'tsx',
    'json',
    'web.jsx',
    'jsx',
  ]

  // Resolve file paths in the same order as webpack
  const resolveModule = (resolveFn: typeof path.resolve, filePath: string) => {
    const extension = moduleFileExtensions.find((e) =>
      fs.pathExistsSync(resolveFn(`${filePath}.${e}`)),
    )

    if (extension) {
      return resolveFn(`${filePath}.${extension}`)
    }

    return resolveFn(`${filePath}.js`)
  }

  const paths = {
    dotenv: resolveApp('.env'),
    appPath: resolveApp('.'),
    appDist: resolveApp(distDir),
    appPublic: resolveApp('public'),
    appHtml: resolveApp('public/index.html'),
    appIndexJs: resolveModule(resolveApp, 'src/index'),
    appPackageJson: resolveApp('package.json'),
    appSrc: resolveApp('src'),
    appTsConfig: resolveApp('tsconfig.json'),
    appJsConfig: resolveApp('jsconfig.json'),
    proxySetup: resolveApp('src/setupProxy.js'),
    appNodeModules: resolveApp('node_modules'),
    appWebpackCache: resolveApp('node_modules/.cache'),
    appTsBuildInfoFile: resolveApp('node_modules/.cache/tsconfig.tsbuildinfo'),
    swSrc: resolveModule(resolveApp, 'src/service-worker'),
    publicUrlOrPath,
    svgSpritePath: resolveApp('src/icons/svg'),
    moduleFileExtensions,
  }

  return paths
}

export type PathsType = ReturnType<typeof getPaths>
