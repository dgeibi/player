import React, { Component } from 'react'
import { Pause, Play, SkipBack, SkipForward } from 'react-feather'
import { Context } from './PlayerProvider'

import formatSec from '../utils/formatSec'

const BTN_SIZE = 28

class ControlsLeft extends Component {
  state = {}

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
    if (this.removeEvents) {
      this.removeEvents()
    }
  }

  updateState = (key, value) => {
    if (key === 'playing') {
      this.setState({
        [key]: value,
      })
    }
  }

  removeEvents = null

  addEvents = player => {
    player.audio.addEventListener('timeupdate', this.updateCurrentTime)
    player.on('update', this.updateState)

    this.removeEvents = () => {
      player.audio.removeEventListener('timeupdate', this.updateCurrentTime)
      player.removeListener('update', this.updateState)
      this.removeEvents = null
    }
  }

  updateCurrentTime = e => {
    const { currentTime } = e.target
    this.setState({
      currentTime,
    })
  }

  render() {
    return (
      <Context.Consumer>
        {({ player, duration, audio }) => {
          if (!this.removeEvents) {
            this.player = player
            this.addEvents(player)
          }

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
        }}
      </Context.Consumer>
    )
  }
}

export default ControlsLeft
