export default (emitter, dom = false) => {
  const ON = dom ? 'addEventListener' : 'on'
  const OFF = dom ? 'removeEventListener' : 'removeListener'
  const observables = []
  return {
    [ON](type, listener, ...rest) {
      const destory = () => emitter[OFF](type, listener, ...rest)
      emitter[ON](type, listener, ...rest)
      observables.push(destory)
      return destory
    },
    [OFF](type, listener, ...rest) {
      emitter[OFF](type, listener, ...rest)
    },
    removeAllObservables() {
      const ret = observables.map(x => x())
      observables.splice(0)
      return ret
    },
  }
}
