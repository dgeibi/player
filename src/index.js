import React from 'react'
import ReactDOM from 'react-dom'

import loadSW from './loadSW'
import Player from './Player'
import './styles/style.scss'

import PlayerProvider from './components/PlayerProvider'
import Shell from './components/Shell'

const HOT = module.hot
if (!HOT) {
  loadSW()
}

const render = (ele, hydrate = false) => {
  if (hydrate) {
    ReactDOM.hydrate(ele, document.getElementById('root'))
  } else {
    ReactDOM.render(ele, document.getElementById('root'))
  }
}

const audio = document.querySelector('.player__audio')
/** @type {Promise<Player>} */
const playerPromise = Player.fromStore({ audio })

const Root = () => (
  <PlayerProvider playerPromise={playerPromise} audio={audio}>
    <Shell />
  </PlayerProvider>
)

if (HOT) {
  const { AppContainer } = require('react-hot-loader')

  render(<AppContainer>
    <Root />
  </AppContainer>)

  module.hot.accept(['./components/Shell', './components/PlayerProvider'], () => {
    render(
      <AppContainer>
        <Root />
      </AppContainer>,
      true
    )
  })
} else {
  render(<Root />)
}
