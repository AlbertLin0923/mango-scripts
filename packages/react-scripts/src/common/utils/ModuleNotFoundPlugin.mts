import path from 'node:path'

import { pico } from '@mango-scripts/utils'

import type { Compiler, Compilation } from 'webpack'

class ModuleNotFoundPlugin {
  private appPath: string

  constructor(appPath: string) {
    this.appPath = appPath

    this.getRelativePath = this.getRelativePath.bind(this)
    this.prettierError = this.prettierError.bind(this)
  }

  private getRelativePath(_file: string): string {
    let file = path.relative(this.appPath, _file)
    if (file.startsWith('..')) {
      file = _file
    } else if (!file.startsWith('.')) {
      file = '.' + path.sep + file
    }
    return file
  }

  private prettierError(err: any): any {
    const { details: _details = '', origin } = err

    if (origin == null) {
      const caseSensitivity =
        err.message &&
        /\[CaseSensitivePathsPlugin\] `(.*?)` .* `(.*?)`/.exec(err.message)
      if (caseSensitivity) {
        const [, incorrectPath, actualName] = caseSensitivity
        const actualFile = this.getRelativePath(
          path.join(path.dirname(incorrectPath), actualName),
        )
        const incorrectName = path.basename(incorrectPath)
        err.message = `Cannot find file: '${incorrectName}' does not match the corresponding name on disk: '${actualFile}'.`
      }
      return err
    }

    const file = this.getRelativePath(origin.resource)
    let details = _details.split('\n')

    const request = /resolve '(.*?)' in '(.*?)'/.exec(details)
    if (request) {
      const isModule = details[1] && details[1].includes('module')
      const isFile = details[1] && details[1].includes('file')

      const [, target, context] = request

      if (isModule) {
        details = [
          `Cannot find module: '${target}'. Make sure this package is installed.`,
          '',
          'You can install this package by running: ' +
            pico.bold(`pnpm install ${target}`) +
            '.',
        ]
      } else if (isFile) {
        details = [
          `Cannot find file '${target}' in '${this.getRelativePath(context)}'.`,
        ]
      } else {
        details = [err.message]
      }
    } else {
      details = [err.message]
    }
    err.message = [file, ...details].join('\n').replace('Error: ', '')

    const isModuleScopePluginError =
      err.error && (err.error as any).__module_scope_plugin
    if (isModuleScopePluginError) {
      err.message = err.message.replace('Module not found: ', '')
    }
    return err
  }

  apply(compiler: Compiler): void {
    const { prettierError } = this
    compiler.hooks.make.intercept({
      register(tap) {
        if (!(tap.name === 'MultiEntryPlugin' || tap.name === 'EntryPlugin')) {
          return tap
        }
        return Object.assign({}, tap, {
          fn: (compilation: Compilation, callback: (...d: any) => void) => {
            tap.fn(compilation, (err: Error, ...args: any[]) => {
              if (err && err.name === 'ModuleNotFoundError') {
                err = prettierError(err as any)
              }
              callback(err, ...args)
            })
          },
        })
      },
    })
    compiler.hooks.normalModuleFactory.tap('ModuleNotFoundPlugin', (nmf) => {
      nmf.hooks.afterResolve.intercept({
        register(tap) {
          if (tap.name !== 'CaseSensitivePathsPlugin') {
            return tap
          }
          return Object.assign({}, tap, {
            fn: (compilation: Compilation, callback: (...d: any) => void) => {
              tap.fn(compilation, (err: Error, ...args: any[]) => {
                if (
                  err &&
                  err.message &&
                  err.message.includes('CaseSensitivePathsPlugin')
                ) {
                  err = prettierError(err as any)
                }
                callback(err, ...args)
              })
            },
          })
        },
      })
    })
  }
}

export default ModuleNotFoundPlugin
