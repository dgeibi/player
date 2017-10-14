import React from 'react'
import PropTypes from 'prop-types'

class ProcessBar extends React.Component {
  static propTypes = {
    audio: PropTypes.object.isRequired,
  }

  constructor(...args) {
    super(...args)
    this.bindListeners()

    const { currentTime, duration } = this.props.audio
    this.state = { currentTime, duration }
  }

  bindListeners() {
    const { audio } = this.props
    audio.addEventListener('timeupdate', () => {
      const { currentTime } = audio

      this.setState({
        currentTime,
      })
    })

    audio.addEventListener('loadeddata', () => {
      const { duration } = audio

      this.setState({
        duration,
      })
    })
  }

  handleRangeChange = (e) => {
    const { audio } = this.props

    this.setState(
      {
        currentTime: e.target.value,
      },
      () => {
        audio.currentTime = this.state.currentTime
      }
    )
  }

  render() {
    const { duration, currentTime } = this.state
    return (
      <div>
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={this.handleRangeChange}
          className="player__process-bar player__range"
        />
      </div>
    )
  }
}

export default ProcessBar
