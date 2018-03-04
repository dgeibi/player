import React from 'react'
import ReactDOM from 'react-dom'
import { message, Spin } from 'antd'

import PlaceHolder, { createFetcher } from './components/PlaceHolder'
import isSWUpdateAvailable from './loadSW'
import createPlainPlayer from './createPlayer'
import './styles/style.css'

import App from './App'

const audio = new Audio()
const createPlayer = createFetcher(() => createPlainPlayer({ audio }))

const render = () => {
  ReactDOM.render(
    <PlaceHolder
      fallback={
        <div className="shell-spin">
          <Spin tip="Loading..." />
        </div>
      }
      renderError={({ error }) => {
        console.log(error)
        return <div>Something Really Wrong! </div>
      }}
    >
      <App createPlayer={createPlayer} />
    </PlaceHolder>,
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
