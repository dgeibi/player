import idb from 'idb'
import Store from './utils/Store'

const PLAYLIST = 'playlist'
const PLAYER = 'player'
const BLOB = 'blob'
const METADATA = 'metadata'

export default function openDB(dbName = 'player') {
  const dbPromise = idb.open(dbName, 1, upgradeDB => {
    upgradeDB.createObjectStore(PLAYLIST, {
      keyPath: 'title',
    })
    upgradeDB.createObjectStore(METADATA, {
      keyPath: 'key',
    })
    upgradeDB.createObjectStore(BLOB)
    upgradeDB.createObjectStore(PLAYER)
  })

  const blobStore = new Store({
    dbPromise,
    storeName: BLOB,
  })

  const playListStore = new Store({
    dbPromise,
    storeName: PLAYLIST,
  })

  const playerStore = new Store({
    dbPromise,
    storeName: PLAYER,
  })

  const metaStore = new Store({
    dbPromise,
    storeName: METADATA,
  })

  const addItem = async ({ file, metadata, key }) => {
    const db = await dbPromise
    const tx = db.transaction([BLOB, METADATA], 'readwrite')
    tx.objectStore(BLOB).put(file, key)
    tx.objectStore(METADATA).put(metadata)
    return tx.complete
  }

  const deleteItem = async key => {
    const db = await dbPromise
    const tx = db.transaction([BLOB, METADATA], 'readwrite')
    tx.objectStore(BLOB).delete(key)
    tx.objectStore(METADATA).delete(key)
    return tx.complete
  }

  return {
    dbPromise,
    deleteItem,
    addItem,
    blobStore,
    playListStore,
    metaStore,
    playerStore,
  }
}
