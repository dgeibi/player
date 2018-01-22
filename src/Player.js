import EventEmitter from 'uemitter'
import nanoid from 'nanoid'
import isPromise from 'is-promise'
import FA from 'fasy'

import parseFile from './utils/id3FromFile'
import PlayList from './PlayList'
import { playListStore, playerStore, metaStore, addItem, deleteItem } from './stores'
import ensureHasKey from './utils/ensure-has-key'
import ensureNumber from './utils/ensure-number'

const FALLBACK_PLAYLIST = '所有歌曲'
const FALLBACK_VOL = 0.5
const FALLBACK_TIME = 0
const noopObj = {}

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
      this.emit('update', key.replace(/ID$/, ''), this.playlists.get(value))
    )
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
    playlistOpts,
    selectedListID,
    playingListID,
    currentTime,
    volume,
  } = {}) {
    this.emitter = EventEmitter()
    Object.assign(this, this.emitter)

    /** @type {HTMLAudioElement} */
    this.audio = audio || new Audio()

    /** @type {Map<string, object>} */
    this.metaDatas = new Map(metaDatas)

    this.loop = Boolean(loop)

    /** @type {Map<string, PlayList>} */
    this.playlists = new Map()
    if (Array.isArray(playlistOpts)) {
      this.importPlayListsFromOpts(playlistOpts)
    }
    this.listOfAll =
      this.playlists.get(FALLBACK_PLAYLIST) ||
      this.createPlayList({ title: FALLBACK_PLAYLIST })

    this.playingListID = ensureHasKey(this.playlists, playingListID, FALLBACK_PLAYLIST)
    this.selectedListID = ensureHasKey(this.playlists, selectedListID, FALLBACK_PLAYLIST)
    this.currentTime = ensureNumber(currentTime, FALLBACK_TIME, 0)
    this.volume = ensureNumber(volume, FALLBACK_VOL, 0, 1)

    /** @type {string} */
    this.currentTrack = null

    this.audio.volume = this.volume

    this.audio.addEventListener('volumechange', () => {
      this.volume = this.audio.volume
    })

    this.audio.addEventListener('loadeddata', () => {
      this.emit('metadata')
    })

    this.audio.addEventListener('ended', () => {
      this.next()
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

    const playlist = this.playlists.get(this.playingListID)

    playlist.setTrack().then(setted => {
      if (!setted) return
      this.audio.currentTime = this.currentTime
    })
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

    return new Player({
      ...opts,
      ...playerOpts,
      audio,
      metaDatas,
      playlistOpts,
    })
  }

  /**
   * @param {Array<File>} fileArr
   */
  async addFiles(fileArr) {
    const { audio, metaDatas, emit } = this
    const files = Array.from(fileArr)
    const tags = await Promise.all(files.map(parseFile))
    const outputs = tags.map(getOutputs).filter(Boolean)
    const playlist = this.listOfAll

    if (outputs.length < 1) return
    const saveFileAndMetaData = async ({ key, metadata, file }) => {
      await addItem({ key, metadata, file })
      playlist.add(key)
      metaDatas.set(key, metadata)
    }
    await FA.concurrent.forEach(saveFileAndMetaData, outputs)
    await playlist.save()

    emit('store-change')

    if (this.selectedListID === FALLBACK_PLAYLIST) {
      this.emitSelectedList()
    }
    if (!this.currentTrack) {
      await this.getPlayingList().setTrack()
    }

    function getOutputs(tag, index) {
      const { album, artist, title } = tag
      const file = files[index]

      const { type } = file

      // android's bug: type is empty
      if (type !== '' && !audio.canPlayType(type)) {
        emit('add-fail', file.name)
        return null
      }

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
    if (!key || !pl || pl === FALLBACK_PLAYLIST) return false
    let playlist = this.playlists.get(pl)

    const IS_NEW_PL = !playlist
    if (IS_NEW_PL) {
      playlist = this.createPlayList({ title: pl })
    }

    const keys = Array.isArray(key) ? key : [key]
    const sizeBefore = playlist.getSize()
    keys.forEach(k => playlist.add(k))
    if (playlist.getSize() <= sizeBefore) return false

    await playlist.save()

    if (IS_NEW_PL) {
      this.emitListsKeys()
    }

    if (pl === this.selectedListID) {
      this.emitSelectedList()
    }

    return true
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
    const { currentTrack } = this
    if (!currentTrack) return
    const playlist = this.getPlayingList()
    if (!playlist || !playlist.keys.has(currentTrack)) {
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

  createPlayList(opts) {
    const opt = Object.assign({}, opts, {
      player: this,
    })
    const playlist = new PlayList(opt)
    this.playlists.set(playlist.title, playlist)
    return playlist
  }

  importPlayListsFromOpts(playlistOpts) {
    playlistOpts.forEach(opt => this.createPlayList(opt))
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
    this.currentTrack = null
    this.emit('empty')
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

  getTrackMetaData() {
    return this.currentTrack ? this.metaDatas.get(this.currentTrack) : noopObj
  }
}

export default Player
