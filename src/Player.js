import EventEmitter from 'uemitter'
import ID3 from 'id3-parser'
import nanoid from 'nanoid'
import isPromise from 'is-promise'
import FA from 'fasy'

import PlayList from './PlayList'
import { playListStore, playerStore, metaStore, addItem, deleteItem } from './stores'
import ensureHasKey from './utils/ensure-has-key'
import ensureNumber from './utils/ensure-number'

const FALLBACK_PLAYLIST = '所有歌曲'
const FALLBACK_VOL = 0.5
const FALLBACK_TIME = 0

const withObserve = shouldSet =>
  function observe(target, key) {
    return {
      get() {
        return this[`_${key}`]
      },

      set(value) {
        if (this[key] !== value) {
          const ret = !shouldSet || shouldSet.call(this, key, value)
          if (ret) {
            this[`_${key}`] = value
            const emit = () => {
              this.emit('update', key, value)
            }
            if (isPromise(ret)) {
              ret.then(emit).catch(() => {
                console.error(`fail to save ${key}`)
              })
            } else {
              emit()
            }
          }
        }
      },
    }
  }

const observe = withObserve()

const savePlayerKey = (key, value) => playerStore.set(key, value)
const observeWithStore = withObserve(savePlayerKey)

const observeListID = withObserve(function emitList(key, value) {
  if (this.playlists.has(value)) {
    return savePlayerKey(key, value).then(() =>
      this.emit('update', key.replace(/ID$/, ''), this.playlists.get(value)))
  }
  return false
})

class Player {
  @observe playing = false
  @observeListID selectedListID = FALLBACK_PLAYLIST
  @observeListID playingListID = FALLBACK_PLAYLIST
  @observeWithStore loop = false
  @observeWithStore volume = FALLBACK_VOL
  @observeWithStore currentTime = FALLBACK_TIME

  constructor({
    audio,
    loop,
    metaDatas,
    playlists,
    selectedListID,
    playingListID,
    currentTime,
    volume,
    emitter,
  } = {}) {
    this.emitter = emitter || EventEmitter()
    Object.assign(this, this.emitter)

    /** @type {HTMLAudioElement} */
    this.audio = audio || new Audio()

    /** @type {Map<string, object>} */
    this.metaDatas = new Map(metaDatas)

    this.loop = Boolean(loop)

    /** @type {Map<string, PlayList>} */
    this.playlists = new Map(playlists)
    if (this.playlists.size === 0) {
      this.playlists.set(
        FALLBACK_PLAYLIST,
        new PlayList({ audio, title: FALLBACK_PLAYLIST })
      )
    }

    this.playingListID = ensureHasKey(this.playlists, playingListID, FALLBACK_PLAYLIST)
    this.selectedListID = ensureHasKey(this.playlists, selectedListID, FALLBACK_PLAYLIST)
    this.currentTime = ensureNumber(currentTime, FALLBACK_TIME, 0)
    this.volume = ensureNumber(volume, FALLBACK_VOL, 0, 1)

    this.audio.volume = this.volume

    this.audio.addEventListener('volumechange', () => {
      this.volume = this.audio.volume
    })

    this.audio.addEventListener('loadeddata', () => {
      this.emit('metadata', this.metaDatas.get(this.audio.dataset.key))
    })

    this.audio.addEventListener('ended', () => {
      this.next(this.loop)
    })

    this.audio.addEventListener('pause', () => {
      this.playing = false
    })

    this.audio.addEventListener('play', () => {
      this.playing = true
    })

    this.audio.addEventListener('timeupdate', () => {
      this.currentTime = this.audio.currentTime
    })

    let listOfAll = this.playlists.get(FALLBACK_PLAYLIST)
    if (!listOfAll) {
      listOfAll = new PlayList({ audio, title: FALLBACK_PLAYLIST })
      this.playlists.set(FALLBACK_PLAYLIST, listOfAll)
    }
    this.listOfAll = listOfAll

    const playlist = this.playlists.get(this.playingListID)

    playlist
      .setTrack()
      .then(() => {
        this.audio.currentTime = this.currentTime
      })
      .catch(() => {})
  }

  static async fromStore(opts) {
    const [playerOpts, playlistOpts, metaDataArr] = await Promise.all([
      playerStore.pick([
        'loop',
        'volume',
        'playingListID',
        'selectedListID',
        'currentTime',
      ]),
      playListStore.getAll(),
      metaStore.getAll(),
    ])

    const metaDatas = metaDataArr.reduce((map, x) => map.set(x.key, x), new Map())

    const audio = opts.audio || new Audio()

    const playlists = playlistOpts.reduce(
      (map, { title, keys, pos }) =>
        map.set(
          title,
          new PlayList({
            title,
            keys,
            audio,
            pos,
          })
        ),
      new Map()
    )

    return new Player({
      ...opts,
      ...playerOpts,
      audio,
      playlists,
      metaDatas,
    })
  }

  /**
   * @param {Array<File>} fileArr
   */
  async addFiles(fileArr) {
    const { metaDatas } = this
    const files = Array.from(fileArr)
    const tags = await Promise.all(files.map(ID3.parse))
    const outputs = tags.map(getOutputs)
    const playlist = this.listOfAll

    const saveFileAndMetaData = async ({ key, metadata, file }) => {
      await addItem({ key, metadata, file })
      playlist.add(key)
      metaDatas.set(key, metadata)
    }
    await FA.concurrent.forEach(saveFileAndMetaData, outputs)
    await playlist.save()

    this.emit('store-change')

    if (this.selectedListID === FALLBACK_PLAYLIST) {
      this.emitSelectedList()
    }
    if (!this.audio.dataset.key) {
      await this.getPlayingList().setTrack()
    }

    function getOutputs(tag, index) {
      const { album, artist, title } = tag
      const file = files[index]
      const key = nanoid()

      const { name } = file
      const metadata = {
        key,
        album,
        artist,
        title,
        name,
      }
      metadata.title = metadata.title || metadata.name.replace(/\.\S*?$/, '')

      return { key, metadata, file }
    }
  }

  /**
   * @param {string|Array<string>} key
   * @param {string} [pl]
   */
  async add(key, pl = this.selectedListID) {
    if (!key || !pl || pl === FALLBACK_PLAYLIST) return
    let playlist = this.playlists.get(pl)

    const IS_NEW_PL = playlist === undefined
    if (IS_NEW_PL) {
      playlist = new PlayList({ audio: this.audio, title: pl })
      this.playlists.set(pl, playlist)
    }

    if (!addKey(playlist.keys)) return

    await playlist.save()

    if (IS_NEW_PL) {
      this.emitListsKeys()
    }

    if (pl === this.selectedListID) {
      this.emitSelectedList()
    }

    function addKey(set) {
      if (Array.isArray(key)) {
        return key.map(x => set.add(x)).some(Boolean)
      }
      return set.add(key)
    }
  }

  /**
   * @param {string|Array<string>} keys
   * @param {string} [pl]
   */
  async delete(keys, pl) {
    if (!keys) return false
    const items = Array.isArray(keys) ? keys : [keys]
    const deleteKeys = set => items.map(x => set.delete(x))

    if (pl && pl !== FALLBACK_PLAYLIST) {
      const playlist = this.playlists.get(pl)
      if (!playlist) return false
      if (!deleteKeys(playlist).includes(true)) return false
      await playlist.save()
      if (pl === this.selectedListID) {
        this.emitSelectedList()
      }
    } else {
      const playlists = [...this.playlists.values()]
      const toBeSaveds = playlists
        .map(playlist => deleteKeys(playlist.keys).includes(true) && playlist.save())
        .filter(Boolean)
      if (toBeSaveds.length < 1) return false

      deleteKeys(this.metaDatas)

      await Promise.all(items.map(deleteItem))
      await Promise.all(toBeSaveds)

      this.emitSelectedList()
    }

    await this.skipForwardIFNotAvailable()
    return true
  }

  async skipForwardIFNotAvailable() {
    const keynow = this.audio.dataset.key
    const playlist = this.playlists.get(this.playingListID)
    if (!playlist || !playlist.keys.has(keynow)) {
      await this.skip('next', false)
    }
  }

  async play(key, pl) {
    const playlist = this.playlists.get(pl || this.playingListID)
    const ret = await playlist.play(key)

    if (ret !== false) {
      if (pl && this.playingListID !== pl) {
        this.playingListID = pl
      }
    }
    return ret
  }

  pause() {
    this.audio.pause()
  }

  stop() {
    this.pause()
    this.playing = false
    this.audio.currentTime = 0
  }

  reset() {
    this.audio.dataset.key = ''
  }

  async skip(method, thenplay = true) {
    const { loop } = this
    const playlist = this.getPlayingList()
    if (await playlist[method](loop)) {
      if (thenplay) return this.play()
      this.stop()
      return true
    }
    this.stop()
    if (playlist.keys.size < 1) {
      this.reset()
      this.emit('empty')
    }
    return false
  }

  previous() {
    return this.skip('previous')
  }

  next() {
    return this.skip('next')
  }

  async deletePlayList(title = this.selectedListID) {
    if (title === FALLBACK_PLAYLIST) return false
    const playlist = this.playlists.get(title)
    if (!playlist) return false
    this.playlists.delete(title)
    if (this.playingListID === title) {
      this.stop()
      this.playingListID = FALLBACK_PLAYLIST
      await this.getPlayingList().setTrack()
    }
    if (this.selectedListID === title) this.selectedListID = FALLBACK_PLAYLIST
    await playlist.destory()
    this.emitListsKeys()
    return true
  }

  emitSelectedList() {
    this.emit('update', 'selectedList', this.getSelectedList())
  }

  emitListsKeys() {
    this.emit('update', 'listsKeys', this.getListsKeys())
  }

  getSelectedList() {
    return this.playlists.get(this.selectedListID)
  }

  getPlayingList() {
    return this.playlists.get(this.playingListID)
  }

  getListsKeys() {
    const { playlists } = this
    return [...playlists.keys()]
  }

  getMetaDatas() {
    const { metaDatas } = this
    const selectedList = this.getSelectedList()
    return [...selectedList.keys].map(k => metaDatas.get(k))
  }
}

export default Player
