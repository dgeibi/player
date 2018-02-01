import React from 'react'
import ReactDOM from 'react-dom'
import { message } from 'antd'

import isSWUpdateAvailable from './loadSW'
import Player from './Player'
import './styles/style.css'

import PlayerProvider from './components/PlayerProvider'
import Shell from './components/Shell'

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
    require('anujs/lib/devtools')
  }

  if (module.hot) {
    module.hot.accept(['./components/Shell', './components/PlayerProvider'], render)
  }
}

render()

isSWUpdateAvailable.then(isAvailable => {
  if (isAvailable) {
    console.log('[sw]: has update!')
    message.info('更新成功，刷新页面以切换至新版 ^_^', 7)
  }
})
