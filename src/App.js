import React from 'react'
import PropTypes from 'prop-types'

import ControlsLeft from './components/ControlsLeft'
import ControlsRight from './components/ControlsRight'
import ProcessBar from './components/ProcessBar'

class App extends React.Component {
  static propTypes = {
    player: PropTypes.object.isRequired,
    audio: PropTypes.object.isRequired,
  }

  constructor(...args) {
    super(...args)
    this.bindListeners()
  }

  state = {
    title: '什么也没有',
  }

  bindListeners() {
    this.props.player.on('metadata', (data) => {
      console.log(data)
      const { artist, title } = data
      let ret = title
      if (artist) ret += ` - ${artist}`
      this.setState({
        title: ret,
      })
    })
  }

  saveFileRef = (node) => {
    this.file = node
  }

  handleFile = (e) => {
    this.props.player.addFiles(e.target.files)
    e.target.value = null
  }

  handleClick = () => {
    this.file.click()
  }

  render() {
    const { player, audio } = this.props
    const { title } = this.state

    return (
      <main>
        <button className="btn file-selector" onClick={this.handleClick}>
          加载本地音乐
          <input
            type="file"
            id="audio-file"
            accept="audio/*"
            multiple
            onChange={this.handleFile}
            ref={this.saveFileRef}
          />
        </button>
        <div className="player">
          <header className="player__title">{title}</header>
          <div className="player__body">
            <ProcessBar player={player} audio={audio} />
            <div className="player__controls">
              <ControlsLeft player={player} audio={audio} />
              <ControlsRight player={player} audio={audio} />
            </div>
          </div>
          <div className="player__playlist" />
        </div>
      </main>
    )
  }
}

export default App
