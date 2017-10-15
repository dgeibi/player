import React from 'react'
import PropTypes from 'prop-types'
import { Repeat } from 'react-feather'
import Volume from './Volume'

class ControlsRight extends React.Component {
  static propTypes = {
    player: PropTypes.object.isRequired,
    audio: PropTypes.object.isRequired,
  }

  constructor(...args) {
    super(...args)
    this.bindListeners()
  }

  handleVolumeChange = (e) => {
    this.props.audio.volume = e.target.value
  }

  bindListeners() {
    this.props.audio.addEventListener('volumechange', () => {
      const { muted, volume } = this.props.audio
      this.setState({
        volume,
        muted,
      })
    })
  }

  handleMuteClick = () => {
    this.props.audio.muted = !this.props.audio.muted
  }

  handleLoopClick = () => {
    const loop = !this.props.player.loop
    this.props.player.loop = loop
    this.setState({
      loop,
    })
  }

  state = {
    volume: this.props.audio.volume,
    muted: this.props.audio.muted,
    loop: this.props.player.loop,
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
