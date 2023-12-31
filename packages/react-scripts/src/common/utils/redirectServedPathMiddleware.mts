import path from 'node:path'

import type express from 'express'

export default function createRedirectServedPathMiddleware(
  servedPath: string,
): express.RequestHandler {
  // remove end slash so user can land on `/test` instead of `/test/`
  servedPath = servedPath.slice(0, -1)

  return function redirectServedPathMiddleware(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ): void {
    if (
      servedPath === '' ||
      req.url === servedPath ||
      req.url.startsWith(servedPath)
    ) {
      next()
    } else {
      const newPath = path.posix.join(
        servedPath,
        req.path !== '/' ? req.path : '',
      )
      res.redirect(newPath)
    }
  }
}
