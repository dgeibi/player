import React, { Component } from 'react'
import { message } from 'antd'
import DocumentTitle from 'react-document-title'

import ControlsLeft from './ControlsLeft'
import ControlsRight from './ControlsRight'
import ProcessBar from './ProcessBar'
import SongsManager from './SongsManager'
import FileBtn from './FileBtn'

import eventObservable from '../utils/event-observable'

const TITLE_FALLBACK = '无标题'
const ARTIST_FALLBACK = '未知艺术家'

class PlayerApp extends Component {
  player = this.props.player

  state = {
    ...this.getMetaData(),
    playingListID: this.player.playingListID,
  }

  playerEvents = eventObservable(this.player)

  getMetaData() {
    const { title, artist } = this.player.getTrackMetaData()
    return {
      title,
      artist,
    }
  }

  componentWillMount() {
    this.playerEvents.on('metadata', () => {
      this.setState(this.getMetaData())
    })

    this.playerEvents.on('empty', () => {
      this.setState({
        title: undefined,
        artist: undefined,
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

  handleFileChange = files => this.player.addFiles(Array.from(files))

  render() {
    const { playingListID } = this.state
    let { title, artist } = this.state
    const docTitle = getDocumetTitle({ title, artist })
    if (!title) {
      title = TITLE_FALLBACK
    }
    if (!artist) {
      artist = ARTIST_FALLBACK
    }

    return (
      <main>
        <DocumentTitle title={docTitle} />
        <FileBtn
          className="file-selector"
          children="加载本地音乐"
          accept="audio/*"
          multiple
          onChange={this.handleFileChange}
        />
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
        <SongsManager player={this.player} />
      </main>
    )
  }
}

export default PlayerApp

function getDocumetTitle({ title, artist }) {
  if (!title) return 'Broken Music Player'
  if (!artist) return title
  return `${title} - ${artist}`
}
