import React from 'react'
import PropTypes from 'prop-types'

const pad = n => (Number(n) < 10 ? `0${n}` : String(n))
const convertSecs = s => `${Math.floor(s / 60)}:${pad(Math.floor(s % 60))}`

class ControlsLeft extends React.Component {
  constructor(...args) {
    super(...args)
    this.bindListeners()
  }

  static propTypes = {
    player: PropTypes.object.isRequired,
    audio: PropTypes.object.isRequired,
  }

  state = {
    playing: false,
  }

  prev = () => {
    this.props.player.previous()
  }

  next = () => {
    this.props.player.next()
  }

  handleToggle = () => {
    const { player } = this.props
    if (this.state.playing) {
      player.pause()
    } else {
      player.play()
    }
  }

  bindListeners() {
    const { player, audio } = this.props

    player.on('play', () => {
      this.setState({
        playing: true,
      })
    })

    player.on('pause', () => {
      this.setState({
        playing: false,
      })
    })

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

  render() {
    const { playing } = this.state
    const { currentTime, duration } = this.props.audio
    return (
      <div className="player__controls--left flex-center flex-middle">
        <span className="player__current-time">{convertSecs(currentTime)}</span>/<span className="player__duration">{convertSecs(duration || 0)}</span>
        <button
          className={`player__button ${playing
            ? 'player__button--pause'
            : 'player__button--play'}`}
          type="button"
          title={playing ? '暂停' : '播放'}
          onClick={this.handleToggle}
        />
        <button
          className="player__button player__button--prev"
          type="button"
          title="上一首"
          onClick={this.prev}
        />
        <button
          className="player__button player__button--next"
          type="button"
          title="下一首"
          onClick={this.next}
        />
      </div>
    )
  }
}

export default ControlsLeft
