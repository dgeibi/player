import EventEmitter from 'uemitter'
import ID3 from 'id3-parser'
import nanoid from 'nanoid'

import combine from './utils/combine'
import PlayList from './PlayList'
import { blobStore, playListStore, playerStore, metaStore } from './stores'

const FALLBACK_PLAYLIST = '所有歌曲'

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
  } = {}) {
    Object.assign(this, EventEmitter())

    /** @type {HTMLAudioElement} */
    this.audio = audio || new Audio()

    /** @type {Map<string, object>} */
    this.metaDatas = new Map(metaDatas)

    this.p = false

    this.loop = Boolean(loop)
    this.playingListID = playingListID || FALLBACK_PLAYLIST
    this.selectedListID = selectedListID || FALLBACK_PLAYLIST
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

    /** @type {Map<string, PlayList>} */
    this.playlists = new Map(playlists)

    if (this.playlists.size === 0) {
      this.playlists.set(
        FALLBACK_PLAYLIST,
        new PlayList({ audio, title: FALLBACK_PLAYLIST })
      )
    }

    this.listOfAll = this.playlists.get(FALLBACK_PLAYLIST)
    const playlist = this.playlists.get(this.playingListID)

    playlist
      .setTrack()
      .then(() => {
        this.audio.currentTime = this.currentTime
      })
      .catch(() => {})
  }

  static async fromStore(audio) {
    const [
      loop,
      volume,
      playingListID,
      selectedListID,
      currentTime,
      playlistOpts,
      metaDataArr,
    ] = await Promise.all([
      playerStore.get('loop'),
      playerStore.get('volume'),
      playerStore.get('playingListID'),
      playerStore.get('selectedListID'),
      playerStore.get('currentTime'),
      playListStore.getAll(),
      metaStore.getAll(),
    ])

    const metaDatas = metaDataArr.reduce((map, x) => map.set(x.key, x), new Map())

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
      audio,
      volume,
      loop,
      selectedListID,
      playingListID,
      playlists,
      metaDatas,
      currentTime,
    })
  }

  set(key, value) {
    this[`_${key}`] = value
    playerStore.set(key, value)
  }

  get(key) {
    return this[`_${key}`]
  }

  set playing(p) {
    this.p = p
    if (!p) this.audio.pause()
    this.emit(p ? 'play' : 'pause')
  }

  get playing() {
    return this.p
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

  delete(key, pl) {
    if (pl && pl !== FALLBACK_PLAYLIST) {
      const playlist = this.playlists.get(pl)

      if (playlist) {
        playlist.keys.delete(key)
        playlist.save()
        this.emit('songs-update')
      }
    } else {
      [...this.playlists.values()].forEach((playlist) => {
        playlist.keys.delete(key)
        playlist.save()
      })

      this.metaDatas.delete(key)
      blobStore.delete(key)
      metaStore.delete(key)
      this.emit('songs-update')
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

  async skip(method) {
    const { loop } = this
    const playlist = this.playlists.get(this.playingListID)
    if (await playlist[method](loop)) {
      return this.play()
    }
    this.stop()
    return false
  }

  previous() {
    return this.skip('previous')
  }

  next() {
    return this.skip('next')
  }
}

function setGet(key) {
  return (F) => {
    Object.defineProperty(F.prototype, key, {
      get() {
        return this.get(key)
      },

      set(v) {
        this.set(key, v)
      },
    })
    return F
  }
}

combine(
  setGet('playingListID'),
  setGet('selectedListID'),
  setGet('loop'),
  setGet('volume'),
  setGet('currentTime')
)(Player)

export default Player
