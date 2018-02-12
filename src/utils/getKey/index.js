// eslint-disable-next-line
import Worker from 'worker-loader!./worker.js'

export default arraybuffer => {
  const worker = new Worker()
  worker.postMessage(arraybuffer, [arraybuffer])

  return new Promise((y, r) => {
    worker.onmessage = e => {
      y(e.data)
      worker.terminate()
    }
    worker.onerror = e => {
      r(Error(e.message))
      worker.terminate()
    }
  })
}
