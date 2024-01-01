import path from 'node:path'

import { pico } from '@mango-scripts/utils'
import table from 'text-table'

import stripAnsi from './stripAnsi.mjs'

const cwd = process.cwd()

const emitErrorsAsWarnings =
  process.env.NODE_ENV === 'development' &&
  process.env.ESLINT_NO_DEV_ERRORS === 'true'

interface ESLintMessage {
  fatal?: boolean
  severity: number
  line?: number
  column?: number
  message: string
  ruleId?: string
}

interface ESLintResult {
  filePath: string
  messages: ESLintMessage[]
}

const isError = (message: ESLintMessage): boolean => {
  return message.fatal || message.severity === 2
}

const getRelativePath = (filePath: string): string =>
  path.relative(cwd, filePath)

const formatter = (results: ESLintResult[]): string => {
  let output = '\n'
  let hasErrors = false
  let reportContainsErrorRuleIDs = false

  results.forEach((result) => {
    let messages: any = result.messages
    if (messages.length === 0) {
      return
    }

    messages = messages.map((message: any) => {
      let messageType: 'error' | 'warn'
      if (isError(message) && !emitErrorsAsWarnings) {
        messageType = 'error'
        hasErrors = true
        if (message.ruleId) {
          reportContainsErrorRuleIDs = true
        }
      } else {
        messageType = 'warn'
      }

      let line = message.line || 0
      if (message.column) {
        line += ':' + message.column
      }
      const position = pico.bold('Line ' + line + ':')
      return [
        '',
        position,
        messageType,
        message.message.replace(/\.$/, ''),
        pico.underline(message.ruleId || ''),
      ]
    })

    // if there are error messages, we want to show only errors
    if (hasErrors) {
      messages = messages.filter((m: any) => m[2] === 'error')
    }

    // add color to rule keywords
    messages.forEach((m: any) => {
      m[4] = m[2] === 'error' ? pico.red(m[4]) : pico.yellow(m[4])
      m.splice(2, 1)
    })

    const outputTable = table(messages, {
      align: ['l', 'l', 'l'],
      stringLength(str: any) {
        return stripAnsi(str).length
      },
    })

    // print the filename and relative path
    output += `${getRelativePath(result.filePath)}\n`

    // print the errors
    output += `${outputTable}\n\n`
  })

  if (reportContainsErrorRuleIDs) {
    // Unlike with warnings, we have to do it here.
    // We have similar code in react-scripts for warnings,
    // but warnings can appear in multiple files so we only
    // print it once at the end. For errors, however, we print
    // it here because we always show at most one error, and
    // we can only be sure it's an ESLint error before exiting
    // this function.
    output +=
      'Search for the ' +
      pico.underline(pico.red('keywords')) +
      ' to learn more about each error.'
  }

  return output
}

export default formatter
