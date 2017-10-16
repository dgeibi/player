import React from 'react'
import PropTypes from 'prop-types'
import eventObservable from '../utils/event-observable'

export default class PlayerProvider extends React.Component {
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

  playerEvents = eventObservable(this.props.player)
  audioEvents = eventObservable(this.props.audio, true)
  state = {
    currentTime: this.props.audio.currentTime || 0,
    duration: this.props.audio.duration || 0,
  }

  componentWillMount() {
    this.audioEvents.addEventListener('timeupdate', () => {
      const { currentTime } = this.props.audio

      this.setState({
        currentTime,
      })
    })

    this.audioEvents.addEventListener('loadeddata', () => {
      const { duration } = this.props.audio

      this.setState({
        duration,
      })
    })

    this.playerEvents.on('empty', () => {
      this.setState({
        duration: 0,
      })
    })
  }

  componentWillUnmount() {
    this.audioEvents.removeAllObservables()
    this.playerEvents.removeAllObservables()
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
