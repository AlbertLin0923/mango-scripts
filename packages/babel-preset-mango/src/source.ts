import path from 'path'

import fs from 'fs-extra'

type Options = {
  runtime?: string
  helpers?: boolean
  forceEnv?: string
  [key: string]: any
}

const extractJson = (key: string, pkgPath: string) => {
  const packageJson = fs.readJSONSync(require.resolve(pkgPath))
  return packageJson[key]
}

const preset = (api: any, opts: Options) => {
  opts = {
    runtime: 'classic',
    helpers: true,
    forceEnv: undefined,
    ...opts,
  }

  // This is similar to how `env` works in Babel:
  // https://babeljs.io/docs/usage/babelrc/#env-option
  // We are not using `env` because it’s ignored in versions > babel-core@6.10.4:
  // https://github.com/babel/babel/issues/4539
  // https://github.com/facebook/create-react-app/issues/720
  // It’s also nice that we can enforce `NODE_ENV` being specified.
  const env = opts.forceEnv || process.env.BABEL_ENV || process.env.NODE_ENV

  const isEnvDevelopment = env === 'development'
  const isEnvProduction = env === 'production'
  const isEnvTest = env === 'test'

  if (!isEnvDevelopment && !isEnvProduction && !isEnvTest) {
    throw new Error(
      'Using babel requires that you specify `NODE_ENV` or ' +
        '`BABEL_ENV` environment variables. Valid values are "development", ' +
        '"test", and "production". Instead, received: ' +
        JSON.stringify(env) +
        '.',
    )
  }

  return {
    presets: [
      isEnvTest && [
        // ES features necessary for user's Node version
        require.resolve('@babel/preset-env'),
        {
          targets: {
            node: 'current',
          },
        },
      ],
      (isEnvProduction || isEnvDevelopment) && [
        // Latest stable ECMAScript features
        require.resolve('@babel/preset-env'),
        {
          // Allow importing core-js in entrypoint and use browserlist to select polyfills
          useBuiltIns: 'entry',
          // Set the corejs version we are using to avoid warnings in console
          corejs: 3,
          // Exclude transforms that make all code slower
          exclude: ['transform-typeof-symbol'],
        },
      ],
      [
        require.resolve('@babel/preset-react'),
        {
          // Adds component stack to warning messages
          // Adds __self attribute to JSX which React will use for some warnings
          development: isEnvDevelopment || isEnvTest,
          // Will use the native built-in instead of trying to polyfill
          // behavior for any plugins that require one.
          ...(opts.runtime !== 'automatic' ? { useBuiltIns: true } : {}),
          runtime: opts.runtime,
        },
      ],
      [require.resolve('@babel/preset-typescript')],
    ].filter(Boolean),
    plugins: [
      // Experimental macros support. Will be documented after it's had some time
      // in the wild.
      require.resolve('babel-plugin-macros'),
      // Turn on legacy decorators for TypeScript files
      [require.resolve('@babel/plugin-proposal-decorators'), false],
      // class { handleClick = () => { } }
      // Enable loose mode to use assignment instead of defineProperty
      // See discussion in https://github.com/facebook/create-react-app/issues/4263
      // Note:
      // 'loose' mode configuration must be the same for
      // * @babel/plugin-proposal-class-properties
      // * @babel/plugin-proposal-private-methods
      // * @babel/plugin-proposal-private-property-in-object
      // (when they are enabled)
      [
        require.resolve('@babel/plugin-proposal-class-properties'),
        {
          loose: true,
        },
      ],
      [
        require.resolve('@babel/plugin-proposal-private-methods'),
        {
          loose: true,
        },
      ],
      [
        require.resolve('@babel/plugin-proposal-private-property-in-object'),
        {
          loose: true,
        },
      ],
      // Adds Numeric Separators
      require.resolve('@babel/plugin-proposal-numeric-separator'),
      // Polyfills the runtime needed for async/await, generators, and friends
      // https://babeljs.io/docs/en/babel-plugin-transform-runtime
      [
        require.resolve('@babel/plugin-transform-runtime'),
        {
          corejs: false,
          helpers: true,
          // By default, babel assumes babel/runtime version 7.0.0-beta.0,
          // explicitly resolving to match the provided helper functions.
          // https://github.com/babel/babel/issues/10261
          version: extractJson('version', '@babel/runtime/package.json'),
          regenerator: true,
          // https://babeljs.io/docs/en/babel-plugin-transform-runtime#useesmodules
          // We should turn this on once the lowest version of Node LTS
          // supports ES Modules.
          useESModules: isEnvDevelopment || isEnvProduction,
          // Undocumented option that lets us encapsulate our runtime, ensuring
          // the correct version is used
          // https://github.com/babel/babel/blob/090c364a90fe73d36a30707fc612ce037bdbbb24/packages/babel-plugin-transform-runtime/src/index.js#L35-L42
          absoluteRuntime: path.dirname(
            require.resolve('@babel/runtime/package.json'),
          ),
        },
      ],
      isEnvProduction && [
        // Remove PropTypes from production build
        require.resolve('babel-plugin-transform-react-remove-prop-types'),
        {
          removeImport: true,
        },
      ],
      // Optional chaining and nullish coalescing are supported in @babel/preset-env,
      // but not yet supported in webpack due to support missing from acorn.
      // These can be removed once webpack has support.
      // See https://github.com/facebook/create-react-app/issues/8445#issuecomment-588512250
      require.resolve('@babel/plugin-proposal-optional-chaining'),
      require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'),
      require.resolve('babel-plugin-jsx-css-modules'),
    ].filter(Boolean),
    overrides: [
      {
        test: /\.tsx?$/,
        plugins: [
          [
            require.resolve('@babel/plugin-proposal-decorators'),
            { legacy: true },
          ],
        ],
      },
    ].filter(Boolean),
  }
}

export default preset
