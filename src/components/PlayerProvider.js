import React from 'react'
import PropTypes from 'prop-types'

export default class PlayerProvider extends React.Component {
  constructor(...args) {
    super(...args)

    const { currentTime, duration } = this.props.audio
    this.state = {
      currentTime: currentTime || 0,
      duration: duration || 0,
    }
    this.bindListeners()
  }

  static childContextTypes = {
    player: PropTypes.object,
    audio: PropTypes.object,
    currentTime: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    duration: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }

  static propTypes = {
    player: PropTypes.object.isRequired,
    audio: PropTypes.object.isRequired,
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.arrayOf(PropTypes.element),
    ]),
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

  getChildContext() {
    const { player, audio } = this.props
    const { currentTime, duration } = this.state
    return {
      player,
      audio,
      currentTime,
      duration,
    }
  }

  render() {
    const { children } = this.props
    return React.Children.only(children)
  }
}
