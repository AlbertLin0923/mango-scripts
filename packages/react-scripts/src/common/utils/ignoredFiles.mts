import path from 'node:path'

import escapeStringRegexp from 'escape-string-regexp'

export default function ignoredFiles(appSrc: string): RegExp {
  return new RegExp(
    `^(?!${escapeStringRegexp(
      path.normalize(appSrc + '/').replace(/[\\]+/g, '/'),
    )}).+/node_modules/`,
    'g',
  )
}
