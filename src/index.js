import React from 'react'
import ReactDOM from 'react-dom'
import { message } from 'antd'

import isSWUpdateAvailable from './loadSW'
import './styles/style.css'
import Root from './Root'

ReactDOM.render(
  <Root
    opts={{
      audio: new Audio(),
    }}
  />,
  document.getElementById('root')
)

isSWUpdateAvailable.then(isAvailable => {
  if (isAvailable) {
    console.log('[sw]: has update!')
    message.info('更新成功，刷新页面以切换至新版 ^_^', 7)
  }
})
