import path from 'node:path'

import { fs, pico } from '@mango-scripts/utils'
import { filesize } from 'filesize'
import recursive from 'recursive-readdir'
import { gzipSizeSync } from 'gzip-size'

import stripAnsi from './stripAnsi.mjs'

interface Asset {
  folder: string
  name: string
  size: number
  sizeLabel: string
}

const canReadAsset = (asset: { name: string }): boolean =>
  /\.(js|css)$/.test(asset.name) &&
  !/service-worker\.js/.test(asset.name) &&
  !/precache-manifest\.[0-9a-f]+\.js/.test(asset.name)

// Prints a detailed summary of build files.
export const printFileSizesAfterBuild = async (
  webpackStats: any,
  previousSizeMap: { root: string; sizes: Record<string, number> },
  buildFolder: string,
  maxBundleGzipSize: number,
  maxChunkGzipSize: number,
): Promise<void> => {
  const root = previousSizeMap.root
  const sizes = previousSizeMap.sizes

  const assets: Asset[] = (webpackStats.stats || [webpackStats])
    .map((stats: any) =>
      stats
        .toJson({ all: false, assets: true })
        .assets.filter((asset: any) => canReadAsset(asset))
        .map((asset: any) => {
          const fileContents = fs.readFileSync(path.join(root, asset.name))
          const size = gzipSizeSync(fileContents)
          const previousSize = sizes[removeFileNameHash(root, asset.name)]
          const difference = getDifferenceLabel(size, previousSize)
          return {
            folder: path.join(
              path.basename(buildFolder),
              path.dirname(asset.name),
            ),
            name: path.basename(asset.name),
            size: size,
            sizeLabel:
              filesize(size) + (difference ? ' (' + difference + ')' : ''),
          }
        }),
    )
    .reduce((single: any, all: any) => all.concat(single), [])

  assets.sort((a, b) => b.size - a.size)

  const longestSizeLabelLength = Math.max(
    ...assets.map((a) => stripAnsi(a.sizeLabel).length),
  )

  let suggestBundleSplitting = false

  for (const asset of assets) {
    let sizeLabel = asset.sizeLabel
    const sizeLength = stripAnsi(sizeLabel).length

    if (sizeLength < longestSizeLabelLength) {
      const rightPadding = ' '.repeat(longestSizeLabelLength - sizeLength)
      sizeLabel += rightPadding
    }

    const isMainBundle = asset.name.indexOf('main.') === 0
    const maxRecommendedSize = isMainBundle
      ? maxBundleGzipSize
      : maxChunkGzipSize
    const isLarge = maxRecommendedSize && asset.size > maxRecommendedSize

    if (isLarge && path.extname(asset.name) === '.js') {
      suggestBundleSplitting = true
    }

    console.log(
      '  ' +
        (isLarge ? pico.yellow(sizeLabel) : sizeLabel) +
        '  ' +
        pico.dim(asset.folder + path.sep) +
        pico.cyan(asset.name),
    )
  }

  if (suggestBundleSplitting) {
    console.log()
    console.log(
      pico.yellow('The bundle size is significantly larger than recommended.'),
    )
    console.log(
      pico.yellow(
        'Consider reducing it with code splitting: https://goo.gl/9VhYWB',
      ),
    )
    console.log(
      pico.yellow(
        'You can also analyze the project dependencies: https://goo.gl/LeUzfb',
      ),
    )
  }
}

const removeFileNameHash = (buildFolder: string, fileName: string): string =>
  fileName
    .replace(buildFolder, '')
    .replace(/\\/g, '/')
    .replace(
      /\/?(.*)(\.[0-9a-f]+)(\.chunk)?(\.js|\.css)/,
      (match, p1, p2, p3, p4) => p1 + p4,
    )

// Input: 1024, 2048
// Output: "(+1 KB)"
const getDifferenceLabel = (
  currentSize: number,
  previousSize: number,
): string => {
  const FIFTY_KILOBYTES = 1024 * 50
  const difference = currentSize - previousSize
  const fileSize = !Number.isNaN(difference) ? filesize(difference) : 0

  if (difference >= FIFTY_KILOBYTES) {
    return pico.red('+' + fileSize)
  } else if (difference < FIFTY_KILOBYTES && difference > 0) {
    return pico.yellow('+' + fileSize)
  } else if (difference < 0) {
    return pico.green(fileSize)
  } else {
    return ''
  }
}

export const measureFileSizesBeforeBuild = async (
  buildFolder: string,
): Promise<{
  root: string
  sizes: Record<string, number>
}> => {
  const fileNames = await recursive(buildFolder)

  let sizes: Record<string, number> = {}

  if (fileNames) {
    sizes = fileNames
      .filter((i: any) => canReadAsset(i))
      .reduce((memo: any, fileName) => {
        const contents = fs.readFileSync(fileName)
        const key = removeFileNameHash(buildFolder, fileName)
        memo[key] = gzipSizeSync(contents)
        return memo
      }, {})
  }

  return {
    root: buildFolder,
    sizes: sizes || {},
  }
}
