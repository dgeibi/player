import React from 'react'
import PropTypes from 'prop-types'

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

  handleLoopChange = (e) => {
    const loop = e.target.checked

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
      <div className="player__controls--right flex-center flex-middle">
        <span>
          <input
            type="checkbox"
            name="loop"
            id="player__loop-toggle"
            className="player__loop-toggle"
            onChange={this.handleLoopChange}
            checked={loop}
          />
          <label
            htmlFor="player__loop-toggle"
            className="player__button player__button--loop"
          />
        </span>
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
