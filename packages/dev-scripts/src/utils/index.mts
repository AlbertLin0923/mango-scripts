import { execa, pico, consola } from '@mango-scripts/utils'

export const run = async (
  bin: string,
  args: string[],
  opts: any = {},
): Promise<any> => {
  // consola.info(`Running command: ${bin} ${args.join(' ')}`)
  return execa(bin, args, { stdio: 'inherit', ...opts })
}

export const step = (msg: string) => consola.info(pico.cyan(msg))
