import EventEmitter from 'uemitter'

import ID3 from 'id3-parser'
import PlayList from './Playlist'

class Player {
  constructor({ audio } = {}) {
    Object.assign(this, EventEmitter())
    /**
     * @type {HTMLAudioElement}
     */
    this.audio = audio || new Audio()
    this.store = new Map()
    this.loop = true
    this.p = false
    this.audio.addEventListener('loadeddata', () => {
      this.emit('metadata', this.store.get(this.audio.src))
    })
    this.audio.addEventListener('ended', () => {
      this.next(this.loop)
    })
    this.defaultPls = new PlayList({
      title: 'default',
      audio,
    })
    this.pls = [this.defaultPls]
    this.listid = 0
  }

  set playing(p) {
    this.p = p
    if (!p) this.audio.pause()
    this.emit(p ? 'play' : 'pause')
  }

  get playing() {
    return this.p
  }

  async addFiles(files) {
    const { store, defaultPls } = this
    const songs = Array.from(files)
    const tags = await Promise.all(songs.map(ID3.parse))
    tags.forEach((tag, index) => {
      const { album, artist, title } = tag
      const url = URL.createObjectURL(songs[index])

      defaultPls.add(url)
      const info = { album, artist, title }

      info.name = songs[index].name
      info.title = info.title || info.name.replace(/\.\S*?$/, '')
      store.set(url, info)
    })
  }

  async play() {
    const ret = await this.pls[this.listid].play()
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

  previous() {
    const { listid, pls, loop } = this
    const pl = pls[listid]
    if (pl.previous(loop)) {
      return this.play()
    }
    this.stop()
    return Promise.resolve(false)
  }

  next() {
    const { listid, pls, loop } = this
    const pl = pls[listid]
    if (pl.next(loop)) {
      return this.play()
    }
    this.stop()
    return Promise.resolve(false)
  }
}

export default Player
