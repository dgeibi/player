import React from 'react'
import { Repeat } from 'react-feather'
import { Slider } from 'antd'
import Volume from './Volume'
import { Context } from './PlayerProvider'

class ControlsRight extends React.Component {
  handleVolumeChange = v => {
    this.audio.volume = v
  }

  removeEvents = null

  addEvents = player => {
    player.audio.addEventListener('volumechange', this.updateVolume)
    player.on('update', this.updatePlayerState)
    this.removeEvents = () => {
      player.audio.removeEventListener('volumechange', this.updateVolume)
      player.removeListener('update', this.updatePlayerState)
      this.removeEvents = null
    }
  }

  componentWillUnmount() {
    if (this.removeEvents) {
      this.removeEvents()
    }
  }

  updateVolume = e => {
    const { muted, volume } = e.target
    this.setState({
      volume,
      muted,
    })
  }

  updatePlayerState = (key, value) => {
    if (key !== 'loop') return
    this.setState({
      [key]: value,
    })
  }

  handleMuteClick = () => {
    this.audio.muted = !this.audio.muted
  }

  handleLoopClick = () => {
    this.player.loop = !this.state.loop
  }

  state = {}

  render() {
    return (
      <Context.Consumer>
        {({ player }) => {
          const { volume, muted } = player.audio
          const { loop } = player
          if (!this.removeEvents) {
            this.player = player
            this.audio = player.audio
            this.addEvents(player)
          }
          return (
            <div className="player__controls--right flex-center">
              <button
                className={`player__button ${
                  loop ? 'player__loop' : 'player__loop--inactive'
                }`}
                title={loop ? '取消循环播放' : '循环播放'}
                onClick={this.handleLoopClick}
              >
                <Repeat size={28} />
              </button>

              <button
                className="player__button"
                title={muted ? '取消静音' : '静音'}
                onClick={this.handleMuteClick}
              >
                <Volume volume={volume} muted={muted} size={28} />
              </button>

              <Slider
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={this.handleVolumeChange}
                tipFormatter={formatF}
                className="player__volume"
              />
            </div>
          )
        }}
      </Context.Consumer>
    )
  }
}

export default ControlsRight

function formatF(value) {
  return `${Math.round(value * 100)}%`
}
