import idb from 'idb'

import Store from './utils/Store'

const dbPromise = idb.open('player', 1, (upgradeDB) => {
  upgradeDB.createObjectStore('playlist', {
    keyPath: 'title',
  })
  upgradeDB.createObjectStore('metadata', {
    keyPath: 'key',
  })
  upgradeDB.createObjectStore('blob')
  upgradeDB.createObjectStore('player')
})

export const blobStore = new Store({
  dbPromise,
  storeName: 'blob',
})

export const playListStore = new Store({
  dbPromise,
  storeName: 'playlist',
})

export const playerStore = new Store({
  dbPromise,
  storeName: 'player',
})

export const metaStore = new Store({
  dbPromise,
  storeName: 'metadata',
})
