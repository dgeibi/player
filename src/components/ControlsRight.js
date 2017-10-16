import React from 'react'
import PropTypes from 'prop-types'
import { Repeat } from 'react-feather'
import Volume from './Volume'

class ControlsRight extends React.Component {
  static contextTypes = {
    player: PropTypes.object.isRequired,
    audio: PropTypes.object.isRequired,
  }

  handleVolumeChange = (e) => {
    this.context.audio.volume = e.target.value
  }

  componentWillMount() {
    this.context.audio.addEventListener('volumechange', this.updateVolume)
  }

  componentWillUnmount() {
    this.context.audio.removeEventListener('volumechange', this.updateVolume)
  }

  updateVolume = () => {
    const { muted, volume } = this.context.audio
    this.setState({
      volume,
      muted,
    })
  }

  handleMuteClick = () => {
    this.context.audio.muted = !this.context.audio.muted
  }

  handleLoopClick = () => {
    const loop = !this.context.player.loop
    this.context.player.loop = loop
    this.setState({
      loop,
    })
  }

  state = {
    volume: this.context.audio.volume,
    muted: this.context.audio.muted,
    loop: this.context.player.loop,
  }

  render() {
    const { volume, loop, muted } = this.state
    return (
      <div className="player__controls--right">
        <button
          className={`player__button ${loop ? 'player__loop' : 'player__loop--inactive'}`}
          title={loop ? '取消循环播放' : '循环播放'}
          onClick={this.handleLoopClick}
        >
          <Repeat />
        </button>
        <button
          className="player__button"
          title={muted ? '取消静音' : '静音'}
          onClick={this.handleMuteClick}
        >
          <Volume volume={volume} muted={muted} />
        </button>
        <input
          className="player__volume player__range"
          type="range"
          min={0.0}
          name="volume"
          max={1.0}
          step={0.01}
          value={volume}
          onChange={this.handleVolumeChange}
        />
      </div>
    )
  }
}

export default ControlsRight
