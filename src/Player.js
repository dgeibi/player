import EventEmitter from 'uemitter'
import ID3 from 'id3-parser'
import nanoid from 'nanoid'

import combine from './utils/combine'
import PlayList from './PlayList'
import { blobStore, playListStore, playerStore, metaStore } from './stores'

const FALLBACK_PLAYLIST = '所有歌曲'

const ensureHasKey = (map, key) => (map.has(key) ? key : null)

const store = (key, value) => playerStore.set(key, value)
const checkList = function checkList(key, value) {
  if (this.playlists.has(value)) {
    return store(key, value)
  }
  return false
}

@combine(
  setGet('playing', function shouldPlayingUpdate(k, v) {
    if (!v) this.audio.pause()
    return true
  }),
  setGet('selectedListID', checkList),
  setGet('playingListID', checkList),
  setGet('loop', store),
  setGet('volume', store),
  setGet('currentTime', store)
)
class Player {
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

    this.p = false

    this.loop = Boolean(loop)

    /** @type {Map<string, PlayList>} */
    this.playlists = new Map(playlists)
    if (this.playlists.size === 0) {
      this.playlists.set(
        FALLBACK_PLAYLIST,
        new PlayList({ audio, title: FALLBACK_PLAYLIST })
      )
    }

    this.playingListID = ensureHasKey(this.playlists, playingListID) || FALLBACK_PLAYLIST
    this.selectedListID =
      ensureHasKey(this.playlists, selectedListID) || FALLBACK_PLAYLIST
    this.currentTime = currentTime || 0
    this.volume = volume || 0.5

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

    this.audio.addEventListener('timeupdate', () => {
      this.currentTime = this.audio.currentTime
    })

    this.listOfAll = this.playlists.get(FALLBACK_PLAYLIST)
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

  async addFiles(f) {
    const { metaDatas } = this
    const files = Array.from(f)
    const tags = await Promise.all(files.map(ID3.parse))

    const playlist = this.listOfAll

    tags.forEach((tag, index) => {
      const { album, artist, title } = tag
      const key = nanoid()
      const file = files[index]
      const { name } = file

      const info = {
        key,
        album,
        artist,
        title,
        name,
      }
      info.title = info.title || info.name.replace(/\.\S*?$/, '')

      playlist.add(key)

      metaDatas.set(key, info)
      metaStore.setValue(info)

      blobStore.set(key, file)
    })

    playlist.save()

    this.emit('songs-update')
  }

  add(key, pl) {
    if (!key) return

    const addKey = (set) => {
      if (Array.isArray(key)) {
        return key.map(x => set.add(x))
      }
      return set.add(key)
    }
    if (pl && pl !== FALLBACK_PLAYLIST) {
      let playlist = this.playlists.get(pl)
      if (playlist === undefined) {
        playlist = new PlayList({ audio: this.audio, title: pl })
        this.playlists.set(pl, playlist)
      }
      addKey(playlist.keys)
      playlist.save()
      this.emit('songs-update')
    }
  }

  delete(key, pl) {
    if (!key) return

    const deleteKey = (set, callback) => {
      const hasCallback = Boolean(callback)
      const deleteX = (x) => {
        const ret = set.delete(x)
        if (hasCallback) callback(x)
        return ret
      }
      if (Array.isArray(key)) {
        return key.map(deleteX)
      }
      return deleteX(key)
    }

    let toSkip = null
    const keynow = this.audio.dataset.key
    const skipTrack = (k) => {
      if (!toSkip && keynow === k) {
        toSkip = k
      }
    }
    if (pl && pl !== FALLBACK_PLAYLIST) {
      const playlist = this.playlists.get(pl)
      if (playlist) {
        deleteKey(playlist.keys, skipTrack)
        playlist.save()
        this.emit('songs-update')
      }
    } else {
      [...this.playlists.values()].forEach((playlist) => {
        deleteKey(playlist.keys, skipTrack)
        playlist.save()
      })

      deleteKey(this.metaDatas)
      deleteKey(blobStore)
      deleteKey(metaStore)
      this.emit('songs-update')
    }
    if (toSkip) {
      this.skip('next', false)
    }
  }

  async play(key, pl) {
    const playlist = this.playlists.get(pl || this.playingListID)
    const ret = await playlist.play(key)

    if (ret !== false) {
      this.playing = true
      if (pl && this.playingListID !== pl) {
        this.playingListID = pl
      }
    }
    return ret
  }

  pause() {
    this.playing = false
  }

  stop() {
    this.pause()
    this.audio.currentTime = 0
  }

  async skip(method, thenplay = true) {
    const { loop } = this
    const playlist = this.playlists.get(this.playingListID)
    if (await playlist[method](loop)) {
      if (thenplay) return this.play()
      this.stop()
      return true
    }
    this.stop()
    if (playlist.keys.size < 1) {
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
}

function setGet(key, shouldSet) {
  return (F) => {
    Object.defineProperty(F.prototype, key, {
      get() {
        return this[`_${key}`]
      },

      set(v) {
        if (this[key] !== v && (!shouldSet || shouldSet.call(this, key, v))) {
          this[`_${key}`] = v
          this.emit(`${String(key).toLowerCase()}-change`, v)
        }
      },
    })
    return F
  }
}

export default Player
