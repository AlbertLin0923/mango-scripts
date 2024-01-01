import path from 'node:path'
import url from 'node:url'

import { fs, pico } from '@mango-scripts/utils'
import { ip } from 'address'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'

import formatWebpackMessages from './formatWebpackMessages.mjs'
import clearConsole from './clearConsole.mjs'

import type { Request, Response } from 'express'
import type { Configuration, Compiler } from 'webpack'

const isInteractive = process.stdout.isTTY

interface Urls {
  lanUrlForConfig?: string
  lanUrlForTerminal?: string
  localUrlForTerminal: string
  localUrlForBrowser: string
}

const prepareUrls = (
  protocol: string,
  host: string,
  port: number,
  pathname = '/',
): Urls => {
  const formatUrl = (hostname: string) =>
    url.format({
      protocol,
      hostname,
      port,
      pathname,
    })

  const prettyPrintUrl = (hostname: string) =>
    url.format({
      protocol,
      hostname,
      port: pico.bold(port.toString()),
      pathname,
    })

  const isUnspecifiedHost = host === '0.0.0.0' || host === '::'
  let prettyHost, lanUrlForConfig, lanUrlForTerminal

  if (isUnspecifiedHost) {
    prettyHost = 'localhost'

    try {
      lanUrlForConfig = ip()
      // This can only return an IPv4 address
      if (lanUrlForConfig) {
        // Check if the address is a private ip
        // https://en.wikipedia.org/wiki/Private_network#Private_IPv4_address_spaces
        if (
          /^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(
            lanUrlForConfig,
          )
        ) {
          // Address is private, format it for later use
          lanUrlForTerminal = prettyPrintUrl(lanUrlForConfig)
        } else {
          // Address is not private, so we will discard it
          lanUrlForConfig = undefined
        }
      }
    } catch (_e) {
      // ignored
    }
  } else {
    prettyHost = host
  }

  const localUrlForTerminal = prettyPrintUrl(prettyHost)
  const localUrlForBrowser = formatUrl(prettyHost)

  return {
    lanUrlForConfig,
    lanUrlForTerminal,
    localUrlForTerminal,
    localUrlForBrowser,
  }
}

const printInstructions = (appName: string, urls: Urls): void => {
  console.log(`\nYou can now view ${pico.bold(appName)} in the browser.\n`)

  if (urls.lanUrlForTerminal) {
    console.log(
      `  ${pico.bold('Local:')}            ${urls.localUrlForTerminal}`,
    )
    console.log(`  ${pico.bold('On Your Network:')}  ${urls.lanUrlForTerminal}`)
  } else {
    console.log(`  ${urls.localUrlForTerminal}`)
  }

  console.log('\nNote that the development build is not optimized.')
  console.log(
    `To create a production build, use ${pico.cyan(`pnpm run build`)}.\n`,
  )
}

const createCompiler = ({
  appName,
  config,
  urls,
  webpack,
}: {
  appName: string
  config: Configuration
  urls: Urls
  webpack: any
}): Compiler => {
  // "Compiler" is a low-level interface to webpack.
  // It lets us listen to some events and provide our own custom messages.
  let compiler: Compiler

  try {
    compiler = webpack(config)
  } catch (err: any) {
    console.log(pico.red('Failed to compile.\n'))
    console.log(err.message || err)
    console.log()
    process.exit(1)
  }

  // "invalid" event fires when you have changed a file, and webpack is
  // recompiling a bundle. WebpackDevServer takes care to pause serving the
  // bundle, so if you refresh, it'll wait instead of serving the old one.
  // "invalid" is short for "bundle invalidated", it doesn't imply any errors.
  compiler.hooks.invalid.tap('invalid', () => {
    if (isInteractive) {
      clearConsole()
    }
    console.log('Compiling...')
  })

  let isFirstCompile = true
  let tsMessagesPromise: Promise<void>

  ForkTsCheckerWebpackPlugin.getCompilerHooks(compiler).waiting.tap(
    'awaitingTypeScriptCheck',
    () => {
      console.log(
        pico.yellow(
          'Files successfully emitted, waiting for typecheck results...',
        ),
      )
    },
  )

  // "done" event fires when webpack has finished recompiling the bundle.
  // Whether or not you have warnings or errors, you will get this event.
  compiler.hooks.done.tap('done', async (stats) => {
    if (isInteractive) {
      clearConsole()
    }

    // We have switched off the default webpack output in WebpackDevServer
    // options so we are going to "massage" the warnings and errors and present
    // them in a readable focused way.
    // We only construct the warnings and errors for speed:
    // https://github.com/facebook/create-react-app/issues/4492#issuecomment-421959548
    const statsData = stats.toJson({
      all: false,
      warnings: true,
      errors: true,
    })

    const messages = formatWebpackMessages(statsData as any)
    const isSuccessful = !messages.errors.length && !messages.warnings.length

    if (isSuccessful) {
      console.log(pico.green('Compiled successfully!'))
    }

    if (isSuccessful && (isInteractive || isFirstCompile)) {
      printInstructions(appName, urls)
    }

    isFirstCompile = false

    // If errors exist, only show errors.
    if (messages.errors.length) {
      // Only keep the first error. Others are often indicative
      // of the same problem, but confuse the reader with noise.
      if (messages.errors.length > 1) {
        messages.errors.length = 1
      }
      console.log(pico.red('Failed to compile.\n'))
      console.log(messages.errors.join('\n\n'))
      return
    }

    // Show warnings if no errors were found.
    if (messages.warnings.length) {
      console.log(pico.yellow('Compiled with warnings.\n'))
      console.log(messages.warnings.join('\n\n'))

      // Teach some ESLint tricks.
      console.log(
        '\nSearch for the ' +
          pico.underline(pico.yellow('keywords')) +
          ' to learn more about each warning.',
      )
      console.log(
        'To ignore, add ' +
          pico.cyan('// eslint-disable-next-line') +
          ' to the line before.\n',
      )
    }
  })

  // You can safely remove this after ejecting.
  // We only use this block for testing of Create React App itself:
  const isSmokeTest = process.argv.some(
    (arg) => arg.indexOf('--smoke-test') > -1,
  )

  if (isSmokeTest) {
    compiler.hooks.failed.tap('smokeTest', async () => {
      await tsMessagesPromise
      process.exit(1)
    })

    compiler.hooks.done.tap('smokeTest', async (stats) => {
      await tsMessagesPromise

      if (stats.hasErrors() || stats.hasWarnings()) {
        process.exit(1)
      } else {
        process.exit(0)
      }
    })
  }

  return compiler
}

const resolveLoopback = (proxy: string): string => {
  const o: any = url.parse(proxy)
  o.host = undefined

  if (o.hostname !== 'localhost') {
    return proxy
  }

  try {
    // Check if we're on a network; if we are, chances are we can resolve
    // localhost. Otherwise, we can just be safe and assume localhost is
    // IPv4 for maximum compatibility.
    if (!ip()) {
      o.hostname = '127.0.0.1'
    }
  } catch (_ignored) {
    o.hostname = '127.0.0.1'
  }

  return url.format(o)
}

// We need to provide a custom onError function for httpProxyMiddleware.
// It allows us to log custom error messages on the console.
const onProxyError =
  (proxy: string) =>
  (err: any, req: Request, res: Response): void => {
    const host = req.headers && req.headers.host

    console.log(
      pico.red('Proxy error:') +
        ' Could not proxy request ' +
        pico.cyan(req.url) +
        ' from ' +
        pico.cyan(host) +
        ' to ' +
        pico.cyan(proxy) +
        '.',
    )

    console.log(
      'See https://nodejs.org/api/errors.html#errors_common_system_errors for more information (' +
        pico.cyan(err.code) +
        ').',
    )

    console.log()

    if (res.writeHead && !res.headersSent) {
      res.writeHead(500)
    }

    res.end(
      'Proxy error: Could not proxy request ' +
        req.url +
        ' from ' +
        host +
        ' to ' +
        proxy +
        ' (' +
        err.code +
        ').',
    )
  }

const prepareProxy = (
  proxy: string,
  appPublicFolder: string,
  servedPathname: string,
): any => {
  // `proxy` lets you specify alternate servers for specific requests.
  if (!proxy) {
    return undefined
  }

  if (typeof proxy !== 'string') {
    console.log(
      pico.red('When specified, "proxy" in package.json must be a string.'),
    )
    console.log(
      pico.red('Instead, the type of "proxy" was "' + typeof proxy + '".'),
    )
    console.log(
      pico.red('Either remove "proxy" from package.json, or make it a string.'),
    )
    process.exit(1)
  }

  // If proxy is specified, let it handle any request except for
  // files in the public folder and requests to the WebpackDevServer socket endpoint.
  // https://github.com/facebook/create-react-app/issues/6720
  const sockPath = process.env.WDS_SOCKET_PATH || '/ws'
  const isDefaultSockHost = !process.env.WDS_SOCKET_HOST

  const mayProxy = (pathname: string): boolean => {
    const maybePublicPath = path.resolve(
      appPublicFolder,
      pathname.replace(new RegExp('^' + servedPathname), ''),
    )

    const isPublicFileRequest = fs.existsSync(maybePublicPath)

    const isWdsEndpointRequest =
      isDefaultSockHost && pathname.startsWith(sockPath)

    return !(isPublicFileRequest || isWdsEndpointRequest)
  }

  if (!/^http(s)?:\/\//.test(proxy)) {
    console.log(
      pico.red(
        'When "proxy" is specified in package.json it must start with either http:// or https://',
      ),
    )
    process.exit(1)
  }

  let target: string

  if (process.platform === 'win32') {
    target = resolveLoopback(proxy)
  } else {
    target = proxy
  }

  return [
    {
      target,
      logLevel: 'silent',
      // For single page apps, we generally want to fallback to /index.html.
      // However we also want to respect `proxy` for API calls.
      // So if `proxy` is specified as a string, we need to decide which fallback to use.
      // We use a heuristic: We want to proxy all the requests that are not meant
      // for static assets and as all the requests for static assets will be using
      // `GET` method, we can proxy all non-`GET` requests.
      // For `GET` requests, if request `accept`s text/html, we pick /index.html.
      // Modern browsers include text/html into `accept` header when navigating.
      // However API calls like `fetch()` won’t generally accept text/html.
      // If this heuristic doesn’t work well for you, use `src/setupProxy.js`.
      context: (pathname: string, req: Request): any => {
        return (
          req.method !== 'GET' ||
          (mayProxy(pathname) &&
            req.headers.accept &&
            req.headers.accept.indexOf('text/html') === -1)
        )
      },
      onProxyReq: (proxyReq: any) => {
        // Browsers may send Origin headers even with same-origin
        // requests. To prevent CORS issues, we have to change
        // the Origin to match the target URL.
        if (proxyReq.getHeader('origin')) {
          proxyReq.setHeader('origin', target)
        }
      },
      onError: onProxyError(target),
      secure: false,
      changeOrigin: true,
      ws: true,
      xfwd: true,
    },
  ]
}

export { createCompiler, prepareProxy, prepareUrls }
