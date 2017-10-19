import React from 'react'
import PropTypes from 'prop-types'

export default class PlayerProvider extends React.Component {
  static childContextTypes = {
    player: PropTypes.object,
    audio: PropTypes.object,
    duration: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }

  static propTypes = {
    playerPromise: PropTypes.object.isRequired,
    audio: PropTypes.object.isRequired,
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.arrayOf(PropTypes.element),
    ]),
  }

  constructor(...args) {
    super(...args)

    this.props.playerPromise.then((player) => {
      this.setState({
        player,
      })
    })
  }

  state = {
    duration: this.props.audio.duration || 0,
    player: null,
  }

  async componentWillReceiveProps(nextProps) {
    if (nextProps.playerPromise !== this.props.playerPromise) {
      const player = await nextProps.playerPromise
      if (player !== this.state.player) {
        this.setState({
          player,
        })
      }
    }
  }

  async componentWillMount() {
    this.props.audio.addEventListener('durationchange', this.updateDuration)
    const player = await this.props.playerPromise
    player.on('empty', this.resetDuration)
  }

  async componentWillUnmount() {
    this.props.audio.removeEventListener('durationchange', this.updateDuration)
    const player = await this.props.playerPromise
    player.removeListener('empty', this.resetDuration)
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
    const { audio } = this.props
    const { duration, player } = this.state
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
