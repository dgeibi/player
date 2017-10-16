import React from 'react'
import PropTypes from 'prop-types'
import { Repeat } from 'react-feather'
import Volume from './Volume'

class ControlsRight extends React.Component {
  static contextTypes = {
    player: PropTypes.object.isRequired,
    audio: PropTypes.object.isRequired,
  }

  audio = this.context.audio
  player = this.context.player

  handleVolumeChange = (e) => {
    this.audio.volume = e.target.value
  }

  componentWillMount() {
    this.audio.addEventListener('volumechange', this.updateVolume)
    this.player.on('loop-change', this.changeLoop)
  }

  componentWillUnmount() {
    this.audio.removeEventListener('volumechange', this.updateVolume)
    this.player.removeListener('loop-change', this.changeLoop)
  }

  updateVolume = () => {
    const { muted, volume } = this.audio
    this.setState({
      volume,
      muted,
    })
  }

  changeLoop = (loop) => {
    this.setState({
      loop,
    })
  }

  handleMuteClick = () => {
    this.audio.muted = !this.audio.muted
  }

  handleLoopClick = () => {
    this.player.loop = !this.state.loop
  }

  state = {
    volume: this.audio.volume,
    muted: this.audio.muted,
    loop: this.player.loop,
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
