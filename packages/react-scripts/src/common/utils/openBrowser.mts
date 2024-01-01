import { execSync, spawn } from 'child_process'

import { pico, open } from '@mango-scripts/utils'

// https://github.com/sindresorhus/open#app
const OSX_CHROME = 'google chrome'

enum Actions {
  NONE = 0,
  BROWSER = 1,
  SCRIPT = 2,
}

const getBrowserEnv = (): {
  action: Actions
  value: string | undefined
  args: string[]
} => {
  // Attempt to honor this environment variable.
  // It is specific to the operating system.
  // See https://github.com/sindresorhus/open#app for documentation.
  const value = process.env.BROWSER
  const args = process.env.BROWSER_ARGS
    ? process.env.BROWSER_ARGS.split(' ')
    : []
  let action
  if (!value) {
    // Default.
    action = Actions.BROWSER
  } else if (value.toLowerCase().endsWith('.js')) {
    action = Actions.SCRIPT
  } else if (value.toLowerCase() === 'none') {
    action = Actions.NONE
  } else {
    action = Actions.BROWSER
  }
  return { action, value, args }
}

const executeNodeScript = (scriptPath: string, url: string): boolean => {
  const extraArgs = process.argv.slice(2)
  const child = spawn(process.execPath, [scriptPath, ...extraArgs, url], {
    stdio: 'inherit',
  })
  child.on('close', (code) => {
    if (code !== 0) {
      console.log()
      console.log(
        pico.red(
          'The script specified as BROWSER environment variable failed.',
        ),
      )
      console.log(pico.cyan(scriptPath) + ' exited with code ' + code + '.')
      console.log()
      return
    }
  })
  return true
}

const startBrowserProcess = (
  browser: string | string[] | undefined,
  url: string,
  args: string[],
): boolean => {
  // If we're on OS X, the user hasn't specifically
  // requested a different browser, we can try opening
  // Chrome with AppleScript. This lets us reuse an
  // existing tab when possible instead of creating a new one.
  const shouldTryOpenChromiumWithAppleScript =
    process.platform === 'darwin' &&
    (typeof browser !== 'string' || browser === OSX_CHROME)

  if (shouldTryOpenChromiumWithAppleScript) {
    // Will use the first open browser found from the list
    const supportedChromiumBrowsers = [
      'Google Chrome Canary',
      'Google Chrome',
      'Microsoft Edge',
      'Brave Browser',
      'Vivaldi',
      'Chromium',
    ]

    for (const chromiumBrowser of supportedChromiumBrowsers) {
      try {
        // Try our best to reuse an existing tab
        // on OSX Chromium-based browser with AppleScript
        execSync('ps cax | grep "' + chromiumBrowser + '"')
        execSync(
          'osascript openChrome.applescript "' +
            encodeURI(url) +
            '" "' +
            chromiumBrowser +
            '"',
          {
            cwd: __dirname,
            stdio: 'ignore',
          },
        )
        return true
      } catch (err) {
        // Ignore errors.
      }
    }
  }

  // Another special case: on OS X, check if BROWSER has been set to "open".
  // In this case, instead of passing `open` to `opn` (which won't work),
  // just ignore it (thus ensuring the intended behavior, i.e. opening the system browser):
  // https://github.com/facebook/create-react-app/pull/1690#issuecomment-283518768
  if (process.platform === 'darwin' && browser === 'open') {
    browser = undefined
  }

  // If there are arguments, they must be passed as an array with the browser
  if (typeof browser === 'string' && args.length > 0) {
    browser = [browser].concat(args)
  }

  // Fallback to open
  // (It will always open a new tab)
  try {
    const options = { app: browser, wait: false, url: true }
    open(url, options as any).catch(() => {}) // Prevent `unhandledRejection` error.
    return true
  } catch (err) {
    return false
  }
}

/**
 * Reads the BROWSER environment variable and decides what to do with it. Returns
 * true if it opened a browser or ran a node.js script, otherwise false.
 */
const openBrowser = (url: string): boolean => {
  const { action, value, args } = getBrowserEnv()
  switch (action) {
    case Actions.NONE:
      // Special case: BROWSER="none" will prevent opening completely.
      return false
    case Actions.SCRIPT:
      return executeNodeScript(value!, url)
    case Actions.BROWSER:
      return startBrowserProcess(value, url, args)
    default:
      throw new Error('Not implemented.')
  }
}

export default openBrowser
