import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'antd'

import ControlsLeft from './ControlsLeft'
import ControlsRight from './ControlsRight'
import ProcessBar from './ProcessBar'
import SongsManager from './SongsManager'

import eventObservable from '../utils/event-observable'

const TITLE_FALLBACK = '什么也没有'
class App extends React.Component {
  static contextTypes = {
    player: PropTypes.object.isRequired,
    audio: PropTypes.object.isRequired,
  }

  player = this.context.player
  state = {
    title: TITLE_FALLBACK,
    playingList: this.player.playingListID,
  }

  playerEvents = eventObservable(this.player)

  componentWillMount() {
    this.playerEvents.on('metadata', (data) => {
      if (!data) return
      const { artist, title } = data
      let ret = title
      if (artist) ret += ` - ${artist}`
      this.setState({
        title: ret,
      })
    })

    this.playerEvents.on('songs-update', () => {
      const { playingList } = this.state
      if (this.player.playlists.get(playingList).keys.size < 1) {
        this.setState({
          title: TITLE_FALLBACK,
        })
      }
    })

    this.playerEvents.on('playinglistid-change', (playingList) => {
      this.setState({
        playingList,
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
    this.player.addFiles(e.target.files)
    e.target.value = null
  }

  handleFileBtnClick = () => {
    this.file.click()
  }

  render() {
    const { title, playingList } = this.state

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
          <header className="player__title">
            <h3>{title}</h3>
            <section>正在播放歌单：{playingList}</section>
          </header>
          <div className="player__body">
            <ProcessBar />
            <div className="player__controls">
              <ControlsLeft />
              <ControlsRight />
            </div>
          </div>
          <div className="player__playlist" />
        </div>
        <SongsManager />
      </main>
    )
  }
}

export default App