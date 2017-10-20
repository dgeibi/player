import React from 'react'
import PropTypes from 'prop-types'
import { Row } from 'antd'
import { Pause, Play, SkipBack, SkipForward } from 'react-feather'

const pad = n => (Number(n) < 10 ? `0${n}` : String(n))
const convertSecs = s => `${Math.floor(s / 60) || 0}:${pad(Math.floor(s % 60) || 0)}`

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
      <Row className="player__controls--left" type="flex" justify="center" align="middle">
        <span className="player__current-time">{convertSecs(currentTime)}</span>/<span className="player__duration">{convertSecs(duration)}</span>
        <button
          className="player__button"
          type="button"
          title={playing ? '暂停' : '播放'}
          onClick={this.handleToggle}
        >
          {playing ? <Pause /> : <Play />}
        </button>
        <button className="player__button" type="button" title="上一首" onClick={this.prev}>
          <SkipBack />
        </button>
        <button className="player__button" type="button" title="下一首" onClick={this.next}>
          <SkipForward />
        </button>
      </Row>
    )
  }
}

export default ControlsLeft
