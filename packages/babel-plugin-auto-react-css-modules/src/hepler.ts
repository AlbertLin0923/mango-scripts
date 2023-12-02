const splitString = (string: string) => string.trim().split(' ')

const getMatcher =
  (styles: Record<string, any>, prefer: 'local' | 'global') =>
  (classNames: string) => {
    if (typeof classNames !== 'string') {
      return null
    }

    let globalClassNames: string[] = []
    let localClassNames: string[] = []
    const restClassNames = splitString(
      classNames
        .replace(/\s{2,}/g, ' ')
        .replace(/:global\([\s\S]*?\)/g, (text) => {
          globalClassNames = globalClassNames.concat(
            splitString(text.replace(/(:global\(|\))/g, '')),
          )
          return ''
        })
        .replace(/:local\([\s\S]*?\)/g, (text) => {
          localClassNames = localClassNames.concat(
            splitString(text.replace(/(:local\(|\))/g, '')),
          )
          return ''
        }),
    )

    if (prefer === 'local') {
      localClassNames = localClassNames.concat(restClassNames)
    } else {
      globalClassNames = globalClassNames.concat(restClassNames)
    }

    return localClassNames
      .map((className) => styles[className] || className)
      .concat(globalClassNames)
      .join(' ')
      .trim()
  }

export default getMatcher
