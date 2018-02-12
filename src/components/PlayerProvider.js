import React, { Component } from 'react'
import PropTypes from 'prop-types'
import createReactContext from 'create-react-context'

export const Context = createReactContext({
  player: null,
  audio: null,
  duration: 0,
})

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
        this.removeEvents(this.state.player)
        this.addEvents(player)
        this.setState({
          player,
        })
      }
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
    const { duration, player } = this.state
    return {
      player,
      audio: player && player.audio,
      duration,
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
