import Sha1 from 'sha.js/sha1'

// eslint-disable-next-line
onmessage = e => {
  postMessage(new Sha1().update(new Uint8Array(e.data)).digest('hex'))
}
