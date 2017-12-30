import React from 'react'
import PropTypes from 'prop-types'
import { message, Button } from 'antd'
import ControlsLeft from './ControlsLeft'
import ControlsRight from './ControlsRight'
import ProcessBar from './ProcessBar'
import SongsManager from './SongsManager'

import eventObservable from '../utils/event-observable'

const TITLE_FALLBACK = '无标题'
const ARTIST_FALLBACK = '未知艺术家'
class App extends React.Component {
  static contextTypes = {
    player: PropTypes.object.isRequired,
    audio: PropTypes.object.isRequired,
  }

  /** @type {Player} */
  player = this.context.player

  state = {
    title: TITLE_FALLBACK,
    artist: ARTIST_FALLBACK,
    playingListID: this.player.playingListID,
    loading: false,
  }

  playerEvents = eventObservable(this.player)

  componentWillMount() {
    this.playerEvents.on('metadata', data => {
      if (!data) return
      const { artist, title } = data
      this.setState({
        title: title || TITLE_FALLBACK,
        artist: artist || ARTIST_FALLBACK,
      })
    })

    this.playerEvents.on('empty', () => {
      this.setState({
        title: TITLE_FALLBACK,
        artist: ARTIST_FALLBACK,
      })
    })

    this.playerEvents.on('update', (key, value) => {
      if (key !== 'playingListID') return
      this.setState({
        [key]: value,
      })
    })

    this.playerEvents.on('add-fail', filename => {
      message.error(`无法添加 ${filename}`)
    })
  }

  componentWillUnmount() {
    this.playerEvents.removeAllObservables()
  }

  saveFileRef = node => {
    this.file = node
  }

  handleFile = async e => {
    this.setState({
      loading: true,
    })
    const files = Array.from(e.target.files)
    e.target.value = null
    await this.player.addFiles(files)
    this.setState({
      loading: false,
    })
  }

  handleFileBtnClick = () => {
    this.file.click()
  }

  render() {
    const { title, playingListID, loading, artist } = this.state

    return (
      <main>
        <Button
          loading={loading}
          className="file-selector"
          onClick={this.handleFileBtnClick}
        >
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
            <h3 className="player__meta">{title}</h3>
            <h4 className="player__meta">{artist}</h4>
            <h4 className="player__meta" title="当前歌单">
              {playingListID}
            </h4>
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
