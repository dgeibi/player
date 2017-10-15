import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'antd'

import ControlsLeft from './components/ControlsLeft'
import ControlsRight from './components/ControlsRight'
import ProcessBar from './components/ProcessBar'
import SongsManager from './components/SongsManager'

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
    metadatas: this.getMetaDatas(),
  }

  getMetaDatas() {
    const { listOfAll, metaDatas } = this.props.player
    return [...listOfAll.keys].map(k => metaDatas.get(k))
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

    this.props.player.on('songs-update', () => {
      this.setState({
        metadatas: this.getMetaDatas(),
      })
    })
  }

  saveFileRef = (node) => {
    this.file = node
  }

  saveDialogRef = (node) => {
    this.dialog = node
  }

  handleFile = (e) => {
    this.props.player.addFiles(e.target.files)
    e.target.value = null
  }

  handleFileBtnClick = () => {
    this.file.click()
  }

  openDialog = () => {
    this.dialog.showModal()
  }

  closeDialog = () => {
    this.dialog.close()
  }

  renderPlayList(metadatas) {
    return metadatas.map(({ title, key }) => <li key={key}>{title}</li>)
  }

  render() {
    const { player, audio } = this.props
    const { title, metadatas } = this.state

    return (
      <main>
        <Button className="file-selector" onClick={this.handleFileBtnClick}>
          加载本地音乐
          <input
            type="file"
            id="audio-file"
            accept="audio/*"
            multiple
            onChange={this.handleFile}
            ref={this.saveFileRef}
          />
        </Button>
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
        <SongsManager data={metadatas} player={player} />
      </main>
    )
  }
}

export default App
