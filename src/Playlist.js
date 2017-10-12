/* eslint-disable no-underscore-dangle */

class PlayList {
  constructor({ title, songs, audio } = {}) {
    this.songs = new Set(songs)
    this.title = title || ''
    this.pos = 0

    /**
     * @type {HTMLAudioElement}
     */
    this.audio = audio || new Audio()
  }

  add(song) {
    this.songs.add(song)
  }

  addSongs(songs) {
    Array.from(songs).forEach(x => this.songs.add(x))
  }

  available() {
    const { songs } = this
    if (songs.size < 1) return false
    return true
  }

  next(loop) {
    const { pos, songs } = this
    if (!this.available()) return false
    if (!loop && pos + 1 === songs.size) return false

    this.pos = (pos + 1) % songs.size
    this._setTrack()
    return true
  }

  previous(loop) {
    const { pos, songs } = this
    if (!this.available()) return false
    if (!loop && pos <= 0) return false

    this.pos = (songs.size + (pos - 1)) % songs.size
    this._setTrack()
    return true
  }

  _setTrack() {
    const { pos, songs } = this
    const newSrc = [...songs][pos]
    const oldSrc = this.audio.src
    if (oldSrc !== newSrc) this.audio.src = newSrc
  }

  play() {
    if (!this.available()) return Promise.resolve(false)
    if (!this.audio.src) this._setTrack()
    return this.audio.play()
  }

  pause() {
    if (!this.available()) return Promise.resolve(false)
    return this.audio.pause()
  }

  getSize() {
    return this.songs.size
  }
}

export default PlayList
