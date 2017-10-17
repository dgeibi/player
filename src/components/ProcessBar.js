import React from 'react'
import PropTypes from 'prop-types'

class ProcessBar extends React.Component {
  static contextTypes = {
    audio: PropTypes.object.isRequired,
    duration: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  }

  audio = this.context.audio

  state = {
    currentTime: this.audio.currentTime || 0,
  }

  handleRangeChange = (e) => {
    this.audio.currentTime = e.target.value
  }

  updateCurrentTime = () => {
    const { currentTime } = this.audio

    this.setState({
      currentTime,
    })
  }

  componentWillMount() {
    this.audio.addEventListener('timeupdate', this.updateCurrentTime)
  }

  componentWillUnmount() {
    this.audio.removeEventListener('timeupdate', this.updateCurrentTime)
  }

  render() {
    const { duration } = this.context
    const { currentTime } = this.state

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
