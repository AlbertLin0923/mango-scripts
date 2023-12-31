import type { Request, Response, NextFunction } from 'express'

const base64SourceMap = (source: any): string => {
  const base64 = Buffer.from(JSON.stringify(source.map()), 'utf8').toString(
    'base64',
  )
  return `data:application/json;charset=utf-8;base64,${base64}`
}

const getSourceById = (server: any, id: string): any => {
  const module: any = Array.from(server._stats.compilation.modules).find(
    (m: any) => server._stats.compilation.chunkGraph.getModuleId(m) === id,
  )
  return module.originalSource()
}

/*
 * Middleware responsible for retrieving a generated source
 * Receives a webpack internal url: "webpack-internal:///<module-id>"
 * Returns a generated source: "<source-text><sourceMappingURL><sourceURL>"
 *
 * Based on EvalSourceMapDevToolModuleTemplatePlugin.js
 */
export default function createEvalSourceMapMiddleware(server: any) {
  return function handleWebpackInternalMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    if (req.url.startsWith('/__get-internal-source')) {
      const fileName = req.query.fileName as string
      const id = fileName.match(/webpack-internal:\/\/\/(.+)/)?.[1]
      if (!id || !server._stats) {
        next()
        return
      }

      const source = getSourceById(server, id)
      const sourceMapURL = `//# sourceMappingURL=${base64SourceMap(source)}`
      const sourceURL = `//# sourceURL=webpack-internal:///${id}`
      res.end(`${source.source()}\n${sourceMapURL}\n${sourceURL}`)
    } else {
      next()
    }
  }
}
