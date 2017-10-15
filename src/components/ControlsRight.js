import React from 'react'
import PropTypes from 'prop-types'
import Switch from 'rc-switch'

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
    this.props.audio.volume = e.target.value / 100
    this.setState({
      volume: e.target.value,
    })
  }

  bindListeners() {
    this.props.audio.addEventListener('volumechange', () => {
      this.setState({
        volume: this.props.audio.volume * 100,
      })
    })
  }

  handleLoopChange = (loop) => {
    this.props.player.loop = loop
    this.setState({
      loop,
    })
  }

  state = {
    volume: this.props.audio.volume * 100,
    loop: this.props.player.loop,
  }

  render() {
    const { volume, loop } = this.state
    return (
      <div className="player__controls--right">
        <Switch
          prefixCls="player__loop-toggle"
          checked={loop}
          onChange={this.handleLoopChange}
          className="player__button"
        />
        <input
          className="player__volume player__range"
          type="range"
          min={0}
          name="volume"
          max={100}
          value={volume}
          onChange={this.handleVolumeChange}
        />
      </div>
    )
  }
}

export default ControlsRight
