import React from 'react'
import ReactDOM from 'react-dom'

import loadSW from './loadSW'
import Player from './Player'
import './styles/style.scss'

import PlayerProvider from './components/PlayerProvider'
import Shell from './components/Shell'

if (process.env.NODE_ENV === 'production') {
  loadSW()
}

const audio = document.querySelector('.player__audio')
/** @type {Promise<Player>} */
const playerPromise = Player.fromStore({ audio })

const render = () => {
  ReactDOM.render(
    <PlayerProvider playerPromise={playerPromise} audio={audio}>
      <Shell />
    </PlayerProvider>,
    document.getElementById('root')
  )
}

if (process.env.NODE_ENV === 'development') {
  if (!process.env.REACT) {
    require('anujs/lib/devtools.js')
  }

  if (module.hot) {
    module.hot.accept(['./components/Shell', './components/PlayerProvider'], render)
  }
}

render()
