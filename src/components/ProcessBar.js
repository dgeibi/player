import React from 'react'
import { Slider } from 'antd'
import formatSec from '../utils/formatSec'

import { Context } from './PlayerProvider'

class ProcessBar extends React.Component {
  state = {}

  handleRangeChange = v => {
    this.audio.currentTime = v
  }

  updateCurrentTime = () => {
    const { currentTime } = this.audio

    this.setState({
      currentTime,
    })
  }

  removeEvents = null
  addEvents(audio) {
    audio.addEventListener('timeupdate', this.updateCurrentTime)
    this.removeEvents = () => {
      audio.removeEventListener('timeupdate', this.updateCurrentTime)
      this.removeEvents = null
    }
  }

  componentWillUnmount() {
    if (this.removeEvents) {
      this.removeEvents()
    }
  }

  render() {
    return (
      <Context.Consumer>
        {({ audio, duration }) => {
          if (!this.removeEvents) {
            this.addEvents(audio)
            this.audio = audio
          }
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
        }}
      </Context.Consumer>
    )
  }
}

export default ProcessBar
