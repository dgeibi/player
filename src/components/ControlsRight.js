import React from 'react'
import { Repeat } from 'react-feather'
import { Slider } from 'antd'
import Volume from './Volume'

class ControlsRight extends React.Component {
  constructor(props) {
    super(props)
    this.player = props.player
    this.audio = props.player.audio
    this.state = {}
  }

  handleVolumeChange = v => {
    this.audio.volume = v
  }

  componentDidMount() {
    this.addEvents()
  }

  componentWillUnmount() {
    this.removeEvents()
  }

  removeEvents() {
    const { player, audio } = this
    audio.removeEventListener('volumechange', this.updateVolume)
    player.removeListener('update', this.updatePlayerState)
  }

  addEvents() {
    const { player, audio } = this
    audio.addEventListener('volumechange', this.updateVolume)
    player.on('update', this.updatePlayerState)
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

  render() {
    const { player, audio } = this
    const { volume, muted } = audio
    const { loop } = player

    return (
      <div className="player__controls--right flex-center">
        <button
          className={`player__button ${loop ? 'player__loop' : 'player__loop--inactive'}`}
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
  }
}

export default ControlsRight

function formatF(value) {
  return `${Math.round(value * 100)}%`
}
