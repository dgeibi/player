/* eslint-disable no-underscore-dangle */
import { blobStore, playListStore } from './stores'

class PlayList {
  constructor({
    title, keys, audio, pos,
  } = {}) {
    /** @type {Set<string>} */
    this.keys = new Set(keys)

    /** @type {string} */
    this.title = title || 'default'

    /** @type {number} */
    this.pos = this.keys.size < pos ? 0 : Number(pos) || 0

    /** @type {HTMLAudioElement} */
    this.audio = audio || new Audio()
  }

  static async getSrc(key) {
    const blob = await blobStore.get(key)
    if (blob) {
      return URL.createObjectURL(blob)
    }
    throw Error('file not found')
  }

  shouldSetSrc({ key }) {
    if (this.audio.dataset.key !== key) {
      this.audio.dataset.key = key
      return true
    }
    return false
  }

  /**
   * @param {string} key
   */
  add(key) {
    this.keys.add(key)
  }

  /**
   * @param {Array<string>} keys
   */
  addKeys(keys) {
    Array.from(keys).forEach(x => this.keys.add(x))
  }

  available() {
    const { keys } = this
    if (keys.size < 1) return false
    return true
  }

  async next(loop) {
    const { pos, keys } = this
    if (!this.available()) return false
    if (!loop && pos + 1 === keys.size) return false

    this.pos = (pos + 1) % keys.size
    await this._setTrack()
    return true
  }

  async previous(loop) {
    const { pos, keys } = this
    if (!this.available()) return false
    if (!loop && pos <= 0) return false

    this.pos = (keys.size + (pos - 1)) % keys.size
    await this._setTrack()
    return true
  }

  async _setTrack() {
    const { audio } = this
    const key = this.getCurrentKey()
    const newSrc = await PlayList.getSrc(key)

    if (this.shouldSetSrc({ newSrc, key })) {
      URL.revokeObjectURL(audio.src)
      audio.src = newSrc
      this.save()
    }
  }

  save() {
    const { title, keys, pos } = this
    if (keys.size > 0) {
      playListStore.setValue({ title, keys, pos })
    } else {
      playListStore.delete(title)
    }
  }

  setTrack() {
    if (!this.available()) return Promise.reject()
    return this._setTrack()
  }

  async play(key) {
    if (!this.available()) return false

    if (key !== undefined) {
      const pos = [...this.keys].indexOf(key)
      if (pos === -1) return false
      this.pos = pos
      await this._setTrack()
    } else if (!this.audio.src || !this.keys.has(this.audio.dataset.key)) {
      await this._setTrack()
    }

    return this.audio.play()
  }

  pause() {
    if (!this.available()) return Promise.resolve(false)
    return this.audio.pause()
  }

  getCurrentKey() {
    const { pos, keys } = this
    if (keys.size < 1) return null
    return [...keys][pos]
  }

  getSize() {
    return this.keys.size
  }
}

export default PlayList
