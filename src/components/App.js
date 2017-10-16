import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'antd'

import ControlsLeft from './ControlsLeft'
import ControlsRight from './ControlsRight'
import ProcessBar from './ProcessBar'
import SongsManager from './SongsManager'

import eventObservable from '../utils/event-observable'

class App extends React.Component {
  static contextTypes = {
    player: PropTypes.object.isRequired,
    audio: PropTypes.object.isRequired,
  }

  state = {
    title: '什么也没有',
    metadatas: this.getMetaDatas(),
  }

  playerEvents = eventObservable(this.context.player)

  getMetaDatas() {
    const { listOfAll, metaDatas } = this.context.player
    return [...listOfAll.keys].map(k => metaDatas.get(k))
  }

  componentWillMount() {
    this.playerEvents.on('metadata', (data) => {
      const { artist, title } = data
      let ret = title
      if (artist) ret += ` - ${artist}`
      this.setState({
        title: ret,
      })
    })

    this.playerEvents.on('songs-update', () => {
      this.setState({
        metadatas: this.getMetaDatas(),
      })
    })
  }

  componentWillUnmount() {
    this.playerEvents.removeAllObservables()
  }

  saveFileRef = (node) => {
    this.file = node
  }

  handleFile = (e) => {
    this.context.player.addFiles(e.target.files)
    e.target.value = null
  }

  handleFileBtnClick = () => {
    this.file.click()
  }

  render() {
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
            <ProcessBar />
            <div className="player__controls">
              <ControlsLeft />
              <ControlsRight />
            </div>
          </div>
          <div className="player__playlist" />
        </div>
        <SongsManager data={metadatas} />
      </main>
    )
  }
}

export default App
