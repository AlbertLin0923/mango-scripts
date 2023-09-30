import { applyEnv } from '../config/getEnv'
import { getWebpackConfig } from '../config/webpack.config'

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', (err) => {
  throw err
})

const inspect = async (mode: string) => {
  try {
    // apply env
    applyEnv(mode, 'production')

    const config = getWebpackConfig()

    console.log(JSON.stringify(config))
  } catch (err: any) {
    if (err && err.message) {
      console.log(err.message)
    }
    process.exit(1)
  }
}

export default inspect
