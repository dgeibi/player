import React from 'react'
import PropTypes from 'prop-types'
import { Pause, Play, SkipBack, SkipForward } from 'react-feather'

import formatSec from '../utils/formatSec'

const BTN_SIZE = 28

class ControlsLeft extends React.Component {
  static contextTypes = {
    player: PropTypes.object.isRequired,
    audio: PropTypes.object.isRequired,
    duration: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }

  /** @type {HTMLAudioElement} */
  audio = this.context.audio
  player = this.context.player

  state = {
    playing: this.player.playing,
  }

  prev = () => {
    this.player.previous()
  }

  next = () => {
    this.player.next()
  }

  handleToggle = () => {
    const { player } = this
    if (this.state.playing) {
      player.pause()
    } else {
      player.play()
    }
  }

  componentWillUnmount() {
    this.audio.removeEventListener('timeupdate', this.updateCurrentTime)
    this.player.removeListener('update', this.updateState)
  }

  componentWillMount() {
    this.audio.addEventListener('timeupdate', this.updateCurrentTime)
    this.player.on('update', this.updateState)
  }

  updateState = (key, value) => {
    if (key === 'playing') {
      this.setState({
        [key]: value,
      })
    }
  }

  updateCurrentTime = () => {
    const { currentTime } = this.audio

    this.setState({
      currentTime,
    })
  }

  render() {
    const { currentTime, playing } = this.state
    const { duration } = this.context

    return (
      <div className="player__controls--left flex-center">
        <span className="player__current-time">{formatSec(currentTime)}</span>/<span className="player__duration">
          {formatSec(duration)}
        </span>
        <button
          className="player__button"
          type="button"
          title={playing ? '暂停' : '播放'}
          onClick={this.handleToggle}
        >
          {playing ? <Pause size={BTN_SIZE} /> : <Play size={BTN_SIZE} />}
        </button>
        <button
          className="player__button"
          type="button"
          title="上一首"
          onClick={this.prev}
        >
          <SkipBack size={BTN_SIZE} />
        </button>
        <button
          className="player__button"
          type="button"
          title="下一首"
          onClick={this.next}
        >
          <SkipForward size={BTN_SIZE} />
        </button>
      </div>
    )
  }
}

export default ControlsLeft
