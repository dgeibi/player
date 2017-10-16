import React from 'react'
import PropTypes from 'prop-types'
import { Row } from 'antd'
import { Pause, Play, SkipBack, SkipForward } from 'react-feather'

import eventObservable from '../utils/event-observable'

const pad = n => (Number(n) < 10 ? `0${n}` : String(n))
const convertSecs = s => `${Math.floor(s / 60) || 0}:${pad(Math.floor(s % 60) || 0)}`

class ControlsLeft extends React.Component {
  static contextTypes = {
    player: PropTypes.object.isRequired,
    audio: PropTypes.object.isRequired,
    currentTime: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    duration: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }

  playerEvents = eventObservable(this.context.player)
  state = {
    playing: this.context.player.playing,
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

  componentWillUnmount() {
    this.playerEvents.removeAllObservables()
  }

  componentWillMount() {
    this.playerEvents.on('play', () => {
      this.setState({
        playing: true,
      })
    })

    this.playerEvents.on('pause', () => {
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
