import React from 'react'
import PropTypes from 'prop-types'

class ProcessBar extends React.Component {
  static contextTypes = {
    audio: PropTypes.object.isRequired,
    duration: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  }

  constructor(...args) {
    super(...args)

    const { currentTime } = this.context.audio
    this.state = { currentTime }
  }

  handleRangeChange = (e) => {
    const { audio } = this.context

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
    const { currentTime } = this.state
    const { duration } = this.context
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
