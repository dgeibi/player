/* eslint-disable no-underscore-dangle */
import { blobStore, playListStore } from './stores'

class PlayList {
  constructor({
    title, keys, pos, player,
  } = {}) {
    /** @type {Set<string>} */
    this.keys = new Set(keys)

    /** @type {string} */
    this.title = title || 'default'

    /** @type {number} */
    this.pos = this.keys.size < pos ? 0 : Number(pos) || 0

    this.player = player
    if (!player) throw Error('player is required!')

    /** @type {HTMLAudioElement} */
    this.audio = this.player.audio
  }

  static async getUrlByKey(key) {
    const blob = await blobStore.get(key)
    if (blob) {
      return URL.createObjectURL(blob)
    }
    throw Error('file not found')
  }

  shouldSetSrc(key) {
    return this.player.currentTrack !== key
  }

  /**
   * @param {string} key
   */
  add(key) {
    return this.keys.add(key)
  }

  delete(key) {
    return this.keys.delete(key)
  }

  destory() {
    const { title } = this
    this.keys = null
    return playListStore.delete(title)
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
    await this.setTrack()
    return true
  }

  async previous(loop) {
    const { pos, keys } = this
    if (!this.available()) return false
    if (!loop && pos <= 0) return false

    this.pos = (keys.size + (pos - 1)) % keys.size
    await this.setTrack()
    return true
  }

  async setTrack() {
    const { audio } = this
    const key = this.getCurrentTrack()

    const toset = this.shouldSetSrc(key)
    if (toset) {
      this.player.currentTrack = key
      URL.revokeObjectURL(audio.src)
      const newSrc = await PlayList.getUrlByKey(key)
      audio.src = newSrc
      this.save()
    }
    return toset
  }

  save() {
    const { title, keys, pos } = this
    return playListStore.setValue({ title, keys, pos })
  }

  async play(key) {
    if (!this.available()) return false

    if (key !== undefined) {
      const pos = [...this.keys].indexOf(key)
      if (pos === -1) return false
      this.pos = pos
      await this.setTrack()
    } else {
      const playerTrack = this.player.currentTrack
      const plTrack = this.getCurrentTrack()
      if (!this.audio.src || !this.keys.has(playerTrack) || plTrack !== playerTrack) {
        await this.setTrack()
      }
    }

    return this.audio.play()
  }

  pause() {
    if (!this.available()) return false
    return this.audio.pause()
  }

  getCurrentTrack() {
    const { pos, keys } = this
    if (keys.size < 1) return null
    return [...keys][pos]
  }

  getSize() {
    return this.keys.size
  }
}

export default PlayList
