import idb from 'idb'

import Store from './utils/Store'

const DB_NAME = 'player'

const PLAYLIST = 'playlist'
const PLAYER = 'player'
const BLOB = 'blob'
const METADATA = 'metadata'

const dbPromise = idb.open(DB_NAME, 1, (upgradeDB) => {
  upgradeDB.createObjectStore(PLAYLIST, {
    keyPath: 'title',
  })
  upgradeDB.createObjectStore(METADATA, {
    keyPath: 'key',
  })
  upgradeDB.createObjectStore(BLOB)
  upgradeDB.createObjectStore(PLAYER)
})

export const blobStore = new Store({
  dbPromise,
  storeName: BLOB,
})

export const playListStore = new Store({
  dbPromise,
  storeName: PLAYLIST,
})

export const playerStore = new Store({
  dbPromise,
  storeName: PLAYER,
})

export const metaStore = new Store({
  dbPromise,
  storeName: METADATA,
})

export const addItem = async ({ file, metadata, key }) => {
  const db = await dbPromise
  const tx = db.transaction([BLOB, METADATA], 'readwrite')
  tx.objectStore(BLOB).put(file, key)
  tx.objectStore(METADATA).put(metadata)
  return tx.complete
}

export const deleteItem = async (key) => {
  const db = await dbPromise
  const tx = db.transaction([BLOB, METADATA], 'readwrite')
  tx.objectStore(BLOB).delete(key)
  tx.objectStore(METADATA).delete(key)
  return tx.complete
}
