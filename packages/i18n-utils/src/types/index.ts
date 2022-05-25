export type LocaleItem = {
  'zh-CN': string
  modules: string
}

export interface ExecResult {
  success: boolean
  message: Array<string>
  readResult: Array<any>
}

export enum Extractor {
  AST = 'ast',
  REGEX = 'regex'
}

export interface ObjectLiteral {
  [key: string]: any
}
