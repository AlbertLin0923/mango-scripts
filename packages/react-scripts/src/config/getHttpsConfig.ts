import fs from 'fs-extra'
import path from 'path'
import crypto from 'crypto'
import pico from 'picocolors'

import getPaths from './getPaths'

// Ensure the certificate and key provided are valid and if not
// throw an easy to debug error
const validateKeyAndCerts = ({
  cert,
  key,
  crtFilePath,
  keyFilePath,
}: {
  cert: crypto.RsaPublicKey | crypto.RsaPrivateKey | crypto.KeyLike
  key: crypto.RsaPrivateKey | crypto.KeyLike
  keyFilePath: string
  crtFilePath: string
}) => {
  let encrypted
  try {
    // publicEncrypt will throw an error with an invalid cert
    encrypted = crypto.publicEncrypt(cert, Buffer.from('test'))
  } catch (err: any) {
    throw new Error(
      `The certificate "${pico.yellow(crtFilePath)}" is invalid.\n${
        err.message
      }`,
    )
  }

  try {
    // privateDecrypt will throw an error with an invalid key
    crypto.privateDecrypt(key, encrypted)
  } catch (err: any) {
    throw new Error(
      `The certificate key "${pico.yellow(keyFilePath)}" is invalid.\n${
        err.message
      }`,
    )
  }
}

// Read file and throw an error if it doesn't exist
function readEnvFile(file: string, type: string): Buffer {
  if (!fs.existsSync(file)) {
    throw new Error(
      `You specified ${pico.cyan(
        type,
      )} in your env, but the file "${pico.yellow(file)}" can't be found.`,
    )
  }
  return fs.readFileSync(file)
}

// Get the https config
// Return cert files if provided in env, otherwise just true or false
function getHttpsConfig(): boolean | { cert: Buffer; key: Buffer } {
  const paths = getPaths()

  const { SSL_CRT_FILE_PATH, SSL_KEY_FILE_PATH, USE_HTTPS } = process.env
  const useHttps = USE_HTTPS === 'true'

  if (useHttps && SSL_CRT_FILE_PATH && SSL_KEY_FILE_PATH) {
    const crtFilePath = path.resolve(paths.appPath, SSL_CRT_FILE_PATH)
    const keyFilePath = path.resolve(paths.appPath, SSL_KEY_FILE_PATH)
    const config = {
      cert: readEnvFile(crtFilePath, 'SSL_CRT_FILE_PATH'),
      key: readEnvFile(keyFilePath, 'SSL_KEY_FILE_PATH'),
    }

    validateKeyAndCerts({ ...config, crtFilePath, keyFilePath })
    return config
  }
  return useHttps
}

export default getHttpsConfig
