import React from 'react'
import { Slider } from 'antd'
import PropTypes from 'prop-types'
import formatSec from '../utils/formatSec'

class ProcessBar extends React.Component {
  static contextTypes = {
    audio: PropTypes.object.isRequired,
    duration: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  }

  audio = this.context.audio

  state = {
    currentTime: this.audio.currentTime || 0,
  }

  handleRangeChange = v => {
    this.audio.currentTime = v
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
      <Slider
        value={currentTime}
        onChange={this.handleRangeChange}
        min={0}
        max={duration}
        tipFormatter={formatSec}
        disable={!duration}
      />
    )
  }
}

export default ProcessBar
