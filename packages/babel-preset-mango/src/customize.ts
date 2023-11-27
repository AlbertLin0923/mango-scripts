import crypto from 'crypto'

const preset = () => {
  return {
    // This function transforms the Babel configuration on a per-file basis
    config(config: any, { source }: { source: any }) {
      // Babel Macros are notoriously hard to cache, so they shouldn't be
      // https://github.com/babel/babel/issues/8497
      // We naively detect macros using their package suffix and add a random token
      // to the caller, a valid option accepted by Babel, to compose a one-time
      // cacheIdentifier for the file. We cannot tune the loader options on a per
      // file basis.
      if (new RegExp('[./]macro').test(source)) {
        return Object.assign({}, config.options, {
          caller: Object.assign({}, config.options.caller, {
            craInvalidationToken: crypto.randomBytes(32).toString('hex'),
          }),
        })
      }
      return config.options
    },
  }
}

export default preset
