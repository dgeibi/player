import React from 'react'
import ReactDOM from 'react-dom'

import Player from './Player'
import './styles/style.scss'

import PlayerProvider from './components/PlayerProvider'
import App from './components/App'

const render = (ele) => {
  ReactDOM.render(ele, document.getElementById('root'))
}

const run = async () => {
  const audio = document.querySelector('.player__audio')
  /** @type {Player} */
  const player = await Player.fromStore(audio)

  const Root = () => (
    <PlayerProvider player={player} audio={audio}>
      <App />
    </PlayerProvider>
  )

  if (module.hot) {
    const { AppContainer } = require('react-hot-loader')

    render(<AppContainer>
      <Root />
    </AppContainer>)

    module.hot.accept(['./components/App', './components/PlayerProvider'], () => {
      render(<AppContainer>
        <Root />
      </AppContainer>)
    })
  } else {
    render(<Root />)
  }
}

run()
