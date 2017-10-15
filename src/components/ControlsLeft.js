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

  static contextTypes = {
    player: PropTypes.object.isRequired,
    audio: PropTypes.object.isRequired,
    currentTime: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    duration: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }

  state = {
    playing: false,
  }

  prev = () => {
    this.context.player.previous()
  }

  next = () => {
    this.context.player.next()
  }

  handleToggle = () => {
    const { player } = this.context
    if (this.state.playing) {
      player.pause()
    } else {
      player.play()
    }
  }

  bindListeners() {
    const { player } = this.context

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
  }

  render() {
    const { playing } = this.state
    const { currentTime, duration } = this.context

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
