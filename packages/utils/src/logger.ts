import pico from 'picocolors'

export const prefixes = {
  wait: pico.cyan('wait') + '  -',
  error: pico.red('error') + ' -',
  fatal: pico.red('fatal') + ' -',
  warn: pico.yellow('warn') + '  -',
  ready: pico.green('ready') + ' -',
  info: pico.cyan('info') + '  -',
  event: pico.magenta('event') + ' -',
  debug: pico.gray('debug') + ' -'
}

class Logger {
  wait(...message: string[]) {
    console.log(prefixes.wait, ...message)
  }
  error(...message: string[]) {
    console.error(prefixes.error, ...message)
  }
  warn(...message: string[]) {
    console.warn(prefixes.warn, ...message)
  }
  ready(...message: string[]) {
    console.log(prefixes.ready, ...message)
  }
  info(...message: string[]) {
    console.log(prefixes.info, ...message)
  }
  event(...message: string[]) {
    console.log(prefixes.event, ...message)
  }
  debug(...message: string[]) {
    console.log(prefixes.debug, ...message)
  }
  fatal(...message: string[]) {
    console.error(prefixes.fatal, ...message)
  }
}

function createInstance() {
  const instance = new Logger()
  return instance
}

const logger = createInstance()

export default logger
