import os from 'node:os'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'

import { fs } from '@mango-scripts/utils'

export const require = createRequire(import.meta.url)

const interfaces = os.networkInterfaces()

// Get the local IP address in the LAN in the development environment
export const getLocalHost = () => {
  for (const devName in interfaces) {
    const iface = interfaces[devName]
    if (iface?.length) {
      for (let i = 0; i < iface.length; i++) {
        const alias = iface[i]
        if (
          alias.family === 'IPv4' &&
          alias.address !== '127.0.0.1' &&
          !alias.internal &&
          alias.address.startsWith('10')
        ) {
          // Exit the loop once a matching IP is found to avoid VPN virtual IPs
          return alias.address
        }
      }
    }
  }
}

export const getHash = (env: any) => {
  const hash = createHash('md5')
  hash.update(JSON.stringify(env))
  return hash.digest('hex')
}

export const extractPkgJson = (key: string, pkgPath: string) => {
  const packageJson = fs.readJSONSync(require.resolve(pkgPath))
  return packageJson[key]
}
