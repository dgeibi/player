import React from 'react'
import PropTypes from 'prop-types'

class ProcessBar extends React.Component {
  static contextTypes = {
    audio: PropTypes.object.isRequired,
    duration: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    currentTime: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  }

  handleRangeChange = (e) => {
    const { audio } = this.context
    audio.currentTime = e.target.value
  }

  render() {
    const { duration, currentTime } = this.context
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
