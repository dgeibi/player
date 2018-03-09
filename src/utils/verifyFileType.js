// copy from https://gist.github.com/philfreo/54933d8eccd5a250a23a

/**
 * @param {Uint8Array|Array<number>} sig - pattern from fileSignatures
 * @param {Uint8Array} actual - bytes from file (should already be sliced to match length of sig)
 * @returns {boolean}
 */
const compareSignature = (sig, actual) => {
  if (sig.length !== actual.length) return false
  for (let i = 0, l = sig.length; i < l; i += 1) {
    if (sig[i] !== actual[i] && typeof sig[i] !== 'undefined') return false
  }
  return true
}

// https://en.wikipedia.org/wiki/List_of_file_signatures
const audioFileSignatures = {
  'audio/mpeg': [[0xff, 0xfb], [0x49, 0x44, 0x33]],
  'audio/mp4': [
    [
      undefined,
      undefined,
      undefined,
      undefined,
      0x66,
      0x74,
      0x79,
      0x70,
      0x4d,
      0x34,
      0x41,
      0x20,
    ],
  ],
  'audio/ogg': [[0x4f, 0x67, 0x67, 0x53, 0x00, 0x02, 0x00, 0x00]],
  'audio/flac': [[0x66, 0x4c, 0x61, 0x43, 0x00, 0x00, 0x00, 0x22]],
  'audio/wav': [
    [
      0x52,
      0x49,
      0x46,
      0x46,
      undefined,
      undefined,
      undefined,
      undefined,
      0x57,
      0x41,
      0x56,
      0x45,
    ],
  ],
}

/**
 * @param {Uint8Array} uint8
 * @param {string} type
 */
const matchesFileType = (uint8, type) =>
  Object.prototype.hasOwnProperty.call(audioFileSignatures, type)
    ? audioFileSignatures[type].find(sig =>
        compareSignature(sig, uint8.slice(0, sig.length))
      ) && type
    : undefined

/**
 * @param {Uint8Array} bytes
 * @param {[(string|string[])]} types - e.g. 'mp3' or ['mp3']
 * @returns {string}
 */
const verifyFileType = (bytes, types) => {
  if (types === undefined) {
    types = Object.keys(audioFileSignatures) // eslint-disable-line
  } else if (typeof types === 'string') {
    types = [types] // eslint-disable-line
  } else if (!Array.from(types)) {
    return undefined
  }
  return types.find(type => matchesFileType(bytes, type))
}

export default verifyFileType
