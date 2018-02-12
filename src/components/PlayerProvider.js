import React, { Component } from 'react'
import PropTypes from 'prop-types'
import createReactContext from 'create-react-context'

const defaultContext = {
  player: null,
  audio: null,
  duration: 0,
}

export const Context = createReactContext(defaultContext)

export default class PlayerProvider extends Component {
  static propTypes = {
    playerPromise: PropTypes.object.isRequired,
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.arrayOf(PropTypes.element),
    ]),
  }

  constructor(...args) {
    super(...args)
    this.props.playerPromise.then(player => {
      this.addEvents(player)
      this.setState({
        player,
        duration: player.audio.duration || 0,
      })
    })
  }

  state = {
    player: null,
    duration: NaN,
  }

  async componentWillReceiveProps(nextProps) {
    if (nextProps.playerPromise !== this.props.playerPromise) {
      throw Error('not support change playerPromise')
    }
  }

  addEvents(player) {
    if (!player) return
    player.audio.addEventListener('durationchange', this.updateDuration)
    player.on('empty', this.resetDuration)
  }

  removeEvents(player) {
    if (!player) return
    player.audio.removeEventListener('durationchange', this.updateDuration)
    player.removeListener('empty', this.resetDuration)
  }

  async componentWillUnmount() {
    this.removeEvents(this.state.player)
  }

  updateDuration = e => {
    const { duration } = e.target
    this.setState({
      duration,
    })
  }

  resetDuration = () => {
    this.setState({
      duration: 0,
    })
  }

  getContextValue() {
    const { player, duration } = this.state
    if (!player) {
      return defaultContext
    }
    return {
      player,
      duration: Math.floor(duration),
      audio: player.audio,
    }
  }

  render() {
    return (
      <Context.Provider value={this.getContextValue()}>
        {this.props.children}
      </Context.Provider>
    )
  }
}
