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

const render = ele => {
  ReactDOM.render(ele, document.getElementById('root'))
}

const audio = document.querySelector('.player__audio')
/** @type {Promise<Player>} */
const playerPromise = Player.fromStore({ audio })

const Root = () => (
  <PlayerProvider playerPromise={playerPromise} audio={audio}>
    <Shell />
  </PlayerProvider>
)

render(Root())
if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept(['./components/Shell', './components/PlayerProvider'], () => {
    render(Root())
  })
}
