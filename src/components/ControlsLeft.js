import React from 'react'
import PropTypes from 'prop-types'
import { Row } from 'antd'
import { Pause, Play, SkipBack, SkipForward } from 'react-feather'

const pad = n => (Number(n) < 10 ? `0${n}` : String(n))
const convertSecs = s => `${Math.floor(s / 60)}:${pad(Math.floor(s % 60))}`

class ControlsLeft extends React.Component {
  constructor(...args) {
    super(...args)
    this.bindListeners()
  }

  static propTypes = {
    player: PropTypes.object.isRequired,
    audio: PropTypes.object.isRequired,
  }

  state = {
    playing: false,
    currentTime: this.props.audio.currentTime || 0,
    duration: this.props.audio.duration || 0,
  }

  prev = () => {
    this.props.player.previous()
  }

  next = () => {
    this.props.player.next()
  }

  handleToggle = () => {
    const { player } = this.props
    if (this.state.playing) {
      player.pause()
    } else {
      player.play()
    }
  }

  bindListeners() {
    const { player, audio } = this.props

    player.on('play', () => {
      this.setState({
        playing: true,
      })
    })

    player.on('pause', () => {
      this.setState({
        playing: false,
      })
    })

    audio.addEventListener('timeupdate', () => {
      const { currentTime } = audio

      this.setState({
        currentTime,
      })
    })

    audio.addEventListener('loadeddata', () => {
      const { duration } = audio

      this.setState({
        duration,
      })
    })
  }

  render() {
    const { playing, currentTime, duration } = this.state
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
