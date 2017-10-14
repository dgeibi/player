import EventEmitter from 'uemitter'
import ID3 from 'id3-parser'
import nanoid from 'nanoid'

import PlayList from './PlayList'
import { blobStore, playListStore, playerStore, metaStore } from './stores'

class Player {
  constructor({ audio, loop, metaDatas, playlists, listid, currentTime } = {}) {
    Object.assign(this, EventEmitter())

    /** @type {HTMLAudioElement} */
    this.audio = audio || new Audio()

    /** @type {Map<string, object>} */
    this.metaDatas = new Map(metaDatas)

    this.p = false

    this.audio.addEventListener('loadeddata', () => {
      this.emit('metadata', this.metaDatas.get(this.audio.dataset.key))
    })

    this.audio.addEventListener('ended', () => {
      this.next(this.loop)
    })

    this.audio.addEventListener('timeupdate', () => {
      this.currentTime = this.audio.currentTime
    })

    this.loop = Boolean(loop)
    this.listid = listid || 'default'
    this.currentTime = currentTime || 0

    /** @type {Map<string, PlayList>} */
    this.playlists = new Map(playlists)

    if (this.playlists.size === 0) {
      this.playlists.set('default', new PlayList({ audio, title: 'default' }))
    }

    const playlist = this.getCurrentPlayList()

    playlist.setTrack().then(() => {
      this.audio.currentTime = this.currentTime
    })
  }

  static async fromStore(audio) {
    const [loop, listid, currentTime, playlistOpts, metaDataArr] = await Promise.all([
      playerStore.get('loop'),
      playerStore.get('listid'),
      playerStore.get('currentTime'),
      playListStore.getAll(),
      metaStore.getAll(),
    ])

    const metaDatas = metaDataArr.reduce((map, x) => map.set(x.key, x), new Map())

    const playlists = playlistOpts
      .reduce((map, { title, keys, pos }) =>
        map.set(title, new PlayList({ title, keys, audio, pos })), new Map())

    return new Player({ audio, loop, listid, playlists, metaDatas, currentTime })
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

    const playlist = this.getCurrentPlayList()

    tags.forEach((tag, index) => {
      const { album, artist, title } = tag
      const key = nanoid()
      const file = files[index]
      const { name } = file

      const info = { key, album, artist, title, name }
      info.title = info.title || info.name.replace(/\.\S*?$/, '')

      playlist.add(key)

      metaDatas.set(key, info)
      metaStore.setValue(info)

      blobStore.set(key, file)
    })

    playlist.save()
  }

  getCurrentPlayList() {
    return this.playlists.get(this.listid)
  }

  async play() {
    const playlist = this.getCurrentPlayList()
    const ret = await playlist.play()
    if (ret !== false) this.playing = true
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
    const playlist = this.getCurrentPlayList()
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

function setGet(F, key) {
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

setGet(Player, 'loop')
setGet(Player, 'listid')
setGet(Player, 'currentTime')

export default Player
