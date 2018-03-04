import React, { Component } from 'react'
import { Pause, Play, SkipBack, SkipForward } from 'react-feather'
import formatSec from '../utils/formatSec'

const BTN_SIZE = 28

class ControlsLeft extends Component {
  constructor(props) {
    super(props)
    this.player = props.player
    this.audio = props.player.audio
    this.state = {}
  }

  prev = () => {
    this.player.previous()
  }

  next = () => {
    this.player.next()
  }

  handleToggle = () => {
    const { player } = this
    if (player.playing) {
      player.pause()
    } else {
      player.play()
    }
  }

  componentWillUnmount() {
    this.removeEvents()
  }

  componentDidMount() {
    this.addEvents()
  }

  updateState = (key, value) => {
    if (key === 'playing') {
      this.setState({
        [key]: value,
      })
    }
  }

  addEvents() {
    const { player, audio } = this
    audio.addEventListener('timeupdate', this.updateCurrentTime)
    player.on('update', this.updateState)
  }

  removeEvents() {
    const { player, audio } = this
    audio.removeEventListener('timeupdate', this.updateCurrentTime)
    player.removeListener('update', this.updateState)
  }

  updateCurrentTime = e => {
    const { currentTime } = e.target
    this.setState({
      currentTime,
    })
  }

  render() {
    const { player, audio, duration } = this.props

    return (
      <div className="player__controls--left flex-center">
        <span className="player__current-time">{formatSec(audio.currentTime)}</span>/<span className="player__duration">
          {formatSec(duration)}
        </span>
        <button
          className="player__button"
          type="button"
          title={player.playing ? '暂停' : '播放'}
          onClick={this.handleToggle}
        >
          {player.playing ? <Pause size={BTN_SIZE} /> : <Play size={BTN_SIZE} />}
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
