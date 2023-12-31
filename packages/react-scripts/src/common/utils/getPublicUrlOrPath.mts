import { URL } from 'node:url'

/**
 * 返回带有斜杠结尾的URL或路径
 * 在生产中可以是URL、绝对路径或相对路径
 * 在开发中始终是绝对路径
 * 在开发中可以使用 `path` 模块函数进行操作
 *
 * @param {boolean} isEnvDevelopment - 表示当前环境是否为开发环境。
 * @param {(string|undefined)} homepage - 应用程序主页的有效URL或路径名。
 * @param {(string|undefined)} envPublicUrl - 公共资源基础URL的有效URL或路径名。
 * @returns {string} - 要么是URL，要么是以斜杠结尾的路径。
 */
export default function getPublicUrlOrPath(
  isEnvDevelopment: boolean,
  homepage: string | undefined,
  envPublicUrl: string | undefined,
): string {
  const stubDomain: string = 'https://create-react-app.dev'

  if (envPublicUrl) {
    // 确保末尾存在斜杠
    envPublicUrl = envPublicUrl.endsWith('/')
      ? envPublicUrl
      : envPublicUrl + '/'

    // 验证 `envPublicUrl` 是URL还是路径
    // 如果 `envPublicUrl` 包含域，则忽略 `stubDomain`
    const validPublicUrl: URL = new URL(envPublicUrl, stubDomain)

    return isEnvDevelopment
      ? envPublicUrl.startsWith('.')
        ? '/'
        : validPublicUrl.pathname
      : // 有些应用程序在客户端不使用pushState进行路由。
        // 对于这些应用，可以将 "homepage" 设置为 "." 以启用相对资源路径。
        envPublicUrl
  }

  if (homepage) {
    // 如果末尾存在斜杠，则去掉
    homepage = homepage.endsWith('/') ? homepage : homepage + '/'

    // 验证 `homepage` 是URL还是路径，并仅使用路径名
    const validHomepagePathname: string = new URL(homepage, stubDomain).pathname
    return isEnvDevelopment
      ? homepage.startsWith('.')
        ? '/'
        : validHomepagePathname
      : // 有些应用程序在客户端不使用pushState进行路由。
        // 对于这些应用，可以将 "homepage" 设置为 "." 以启用相对资源路径。
        homepage.startsWith('.')
        ? homepage
        : validHomepagePathname
  }

  return '/'
}
