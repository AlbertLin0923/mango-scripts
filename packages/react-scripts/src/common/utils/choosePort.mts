import detect from 'detect-port'
import pico from 'picocolors'
import prompts from 'prompts'

import clearConsole from './clearConsole.mjs'
import getProcessForPort from './getProcessForPort.mjs'

const choosePort = async (
  host: string,
  defaultPort: number,
): Promise<number | null | undefined> => {
  const isInteractive = process.stdout.isTTY

  try {
    const port = await detect(defaultPort)
    if (port === defaultPort) {
      return port
    }
    const message =
      process.platform !== 'win32' &&
      defaultPort < 1024 &&
      !(process.getuid && process.getuid() === 0)
        ? `Admin permissions are required to run a server on a port below 1024.`
        : `Something is already running on port ${defaultPort}.`

    if (isInteractive) {
      clearConsole()
      const existingProcess = getProcessForPort(defaultPort)

      const { shouldChangePort } = await prompts({
        type: 'confirm',
        name: 'shouldChangePort',
        message:
          pico.yellow(
            message +
              `${existingProcess ? ` Probably:\n  ${existingProcess}` : ''}`,
          ) + '\n\nWould you like to run the app on another port instead?',
        initial: true,
      })
      return shouldChangePort ? port : null
    } else {
      console.log(pico.red(message))
      return null
    }
  } catch (err: any) {
    throw new Error(
      pico.red(`Could not find an open port at ${pico.bold(host)}.`) +
        '\n' +
        ('Network error message: ' + err.message || err) +
        '\n',
    )
  }
}

export default choosePort
