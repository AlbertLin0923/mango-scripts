import path from 'node:path'

import { execa, fs } from '@mango-scripts/utils'

export const getMonorepoPkgListInfo = async (): Promise<string[]> => {
  const pkgDirPathList: string[] = []
  const dirList = await fs.readdir(path.join(process.cwd(), './packages'))
  for (const dir of dirList) {
    const pkgDirPath = path.resolve(process.cwd(), './packages', dir)
    if ((await fs.stat(pkgDirPath)).isDirectory()) {
      pkgDirPathList.push(pkgDirPath)
    }
  }

  return pkgDirPathList
}

const openInTerminalTab = async (command: string): Promise<void> => {
  const script = `
    iterm_path=$(mdfind "kMDItemCFBundleIdentifier == 'com.googlecode.iterm2'")
    terminal_path=$(mdfind "kMDItemCFBundleIdentifier == 'com.apple.Terminal'")

    if [[ -n "$iterm_path" ]]; then
      osascript -e 'tell application "iTerm"
        tell current window
          create tab with default profile
          tell current session of current tab
            write text "${command}"
          end tell
        end tell
      end tell';
    elif [[ -n "$terminal_path" ]]; then
      osascript -e 'tell application "Terminal"
        do script "${command}"
        activate
      end tell';
    else
      echo "无法找到终端Shell，请检查";
    fi
  `

  await execa('sh', ['-c', script])
}

const boot = async () => {
  const pkgDirPathList = await getMonorepoPkgListInfo()
  for (const dir of pkgDirPathList) {
    await openInTerminalTab(`cd ${dir} && pnpm run dev`)
  }
}

boot()
