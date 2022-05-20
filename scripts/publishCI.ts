import path from 'path'
import { args, publishPkg, step } from './releaseUtils'

async function main() {
  const tag = args._[0]

  if (!tag) {
    throw new Error('No tag specified')
  }

  const [pkgName, version] = tag.split('@')

  const rawPkgName = pkgName.split('/')[1]

  const pkgDir = path.join(__dirname, `../packages/${rawPkgName}`)

  step('Publishing package...')
  const releaseTag = version.includes('beta')
    ? 'beta'
    : version.includes('alpha')
    ? 'alpha'
    : undefined
  await publishPkg(pkgDir, releaseTag)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
