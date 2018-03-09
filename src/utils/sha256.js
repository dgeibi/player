// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
export default function sha256(any) {
  // crypto.subtle === undefined if in insecure contexts
  // https://www.chromium.org/blink/webcrypto#TOC-Accessing-it
  if (!crypto.subtle) return false
  let buffer = null
  if (typeof any === 'string') {
    buffer = new TextEncoder('utf-8').encode(any)
  } else if (any instanceof ArrayBuffer) {
    buffer = any
  } else if (any && any.buffer instanceof ArrayBuffer) {
    buffer = any.buffer
  } else {
    throw Error('arg should be arrayBufferView/arrayBuffer/string')
  }
  return crypto.subtle.digest('SHA-256', buffer).then(hex)
}

function hex(buffer) {
  const hexCodes = []
  const view = new DataView(buffer)
  for (let i = 0; i < view.byteLength; i += 4) {
    const value = view.getUint32(i)
    const stringValue = value.toString(16)
    const padding = '00000000'
    const paddedValue = (padding + stringValue).slice(-padding.length)
    hexCodes.push(paddedValue)
  }
  return hexCodes.join('')
}
