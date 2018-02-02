import React from 'react'
import ReactDOM from 'react-dom'
import { message } from 'antd'

import isSWUpdateAvailable from './loadSW'
import createPlayer from './createPlayer'
import './styles/style.css'

import App from './App'

const audio = new Audio()
const playerPromise = createPlayer({ audio })

const render = () => {
  ReactDOM.render(
    <App audio={audio} playerPromise={playerPromise} />,
    document.getElementById('root')
  )
}

if (process.env.NODE_ENV === 'development') {
  if (!process.env.REACT && '__REACT_DEVTOOLS_GLOBAL_HOOK__' in window) {
    require('anujs/lib/devtools')
  }

  if (module.hot) {
    module.hot.accept('./App', render)
  }
}

render()

isSWUpdateAvailable.then(isAvailable => {
  if (isAvailable) {
    console.log('[sw]: has update!')
    message.info('更新成功，刷新页面以切换至新版 ^_^', 7)
  }
})
