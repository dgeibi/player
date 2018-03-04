import React from 'react'
import { Slider } from 'antd'
import formatSec from '../utils/formatSec'

class ProcessBar extends React.Component {
  constructor(props) {
    super(props)
    this.audio = props.audio
    this.state = {}
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

  addEvents() {
    const { audio } = this
    audio.addEventListener('timeupdate', this.updateCurrentTime)
  }

  removeEvents() {
    const { audio } = this
    audio.removeEventListener('timeupdate', this.updateCurrentTime)
  }

  componentWillUnmount() {
    this.removeEvents()
  }

  componentDidMount() {
    this.addEvents()
  }

  render() {
    const { audio, duration } = this.props
    return (
      <Slider
        value={audio.currentTime}
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
