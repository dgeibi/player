import React, { Component, createContext } from 'react'
import PropTypes from 'prop-types'

export const Context = createContext({
  player: null,
  audio: null,
  duration: 0,
})

export default class PlayerProvider extends Component {
  static propTypes = {
    player: PropTypes.object.isRequired,
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.arrayOf(PropTypes.element),
    ]),
  }

  constructor(...args) {
    super(...args)
    const { player } = this.props
    if (!player) throw Error('player should be provided')
    this.addEvents(player)
    this.state = {
      duration: player.audio.duration || 0,
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.player !== this.props.player) {
      throw Error('not support change player')
    }
  }

  addEvents(player) {
    player.audio.addEventListener('durationchange', this.updateDuration)
    player.on('empty', this.resetDuration)
  }

  removeEvents(player) {
    player.audio.removeEventListener('durationchange', this.updateDuration)
    player.removeListener('empty', this.resetDuration)
  }

  componentWillUnmount() {
    this.removeEvents(this.props.player)
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
    const { duration } = this.state
    const { player } = this.props
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
