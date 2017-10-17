import React from 'react'
import PropTypes from 'prop-types'

export default class PlayerProvider extends React.Component {
  static childContextTypes = {
    player: PropTypes.object,
    audio: PropTypes.object,
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

  state = {
    duration: this.props.audio.duration || 0,
  }

  componentWillMount() {
    this.props.audio.addEventListener('loadeddata', this.updateDuration)
    this.props.player.on('empty', this.resetDuration)
  }

  componentWillUnmount() {
    this.props.audio.removeEventListener('loadeddata', this.updateDuration)
    this.props.player.removeListener('empty', this.resetDuration)
  }

  updateDuration = () => {
    const { duration } = this.props.audio

    this.setState({
      duration,
    })
  }

  resetDuration = () => {
    this.setState({
      duration: 0,
    })
  }

  getChildContext() {
    const { player, audio } = this.props
    const { duration } = this.state
    return {
      player,
      audio,
      duration,
    }
  }

  render() {
    const { children } = this.props
    return React.Children.only(children)
  }
}
