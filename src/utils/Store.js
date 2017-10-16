class Store {
  /**
   * @param {object} opts
   * @param {string} opts.dbName
   * @param {string} opts.storeName
   */
  constructor(opts) {
    const { storeName, dbPromise } = opts

    /** @type {Promise} */
    this.dbPromise = dbPromise
    this.storeName = storeName
  }

  get(key) {
    const { dbPromise, storeName } = this

    return dbPromise.then(db =>
      db
        .transaction(storeName)
        .objectStore(storeName)
        .get(key))
  }

  /**
   * @param {Array<string>} keys
   */
  pick(keys) {
    return Promise.all(keys.map(x => this.get(x))).then(values =>
      values.reduce((o, v, i) => {
        o[keys[i]] = v // eslint-disable-line no-param-reassign
        return o
      }, {}))
  }

  set(key, val) {
    const { dbPromise, storeName } = this
    return dbPromise.then((db) => {
      const tx = db.transaction(storeName, 'readwrite')
      tx.objectStore(storeName).put(val, key)
      return tx.complete
    })
  }

  setValue(val) {
    return this.set(undefined, val)
  }

  delete(key) {
    const { dbPromise, storeName } = this

    return dbPromise.then((db) => {
      const tx = db.transaction(storeName, 'readwrite')
      tx.objectStore(storeName).delete(key)
      return tx.complete
    })
  }

  clear() {
    const { dbPromise, storeName } = this

    return dbPromise.then((db) => {
      const tx = db.transaction(storeName, 'readwrite')
      tx.objectStore(storeName).clear()
      return tx.complete
    })
  }

  keys() {
    const { dbPromise, storeName } = this

    return dbPromise.then((db) => {
      const tx = db.transaction(storeName)
      const keys = []
      const store = tx.objectStore(storeName);
      (store.iterateKeyCursor || store.iterateCursor).call(store, (cursor) => {
        if (!cursor) return
        keys.push(cursor.key)
        cursor.continue()
      })

      return tx.complete.then(() => keys)
    })
  }

  getAll() {
    const { dbPromise, storeName } = this

    return dbPromise.then(db =>
      db
        .transaction(storeName)
        .objectStore(storeName)
        .getAll())
  }
}

export default Store
