import React from 'react'
import ReactDom from 'react-dom'

import Player from './Player'
import './styles/style.scss'

import App from './App'

const run = async () => {
  const audio = document.querySelector('.player__audio')
  /** @type {Player} */
  const player = await Player.fromStore(audio)

  ReactDom.render(<App player={player} audio={audio} />, document.querySelector('#root'))
}

run()
