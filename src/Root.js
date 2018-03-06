import React from 'react'
import { Spin } from 'antd'
import { hot } from 'react-hot-loader'
import PlaceHolder from './components/PlaceHolder'
import getPlayer from './getPlayer'
import App from './App'

const renderError = ({ error }) => {
  console.log(error)
  const errorMsgs = ['Something Really Wrong!']
  const t = typeof error
  if (t === 'object' && error) {
    if (error.stack) {
      errorMsgs.push(error.stack)
    } else if (error.message) {
      errorMsgs.push(`Error: ${error.message}`)
    }
  } else if (t === 'string') {
    errorMsgs.push(t)
  }
  return <pre>{errorMsgs.join('\n')}</pre>
}

function Root({ opts }) {
  return (
    <PlaceHolder
      fallback={
        <div className="shell-spin">
          <Spin tip="Loading..." />
        </div>
      }
      renderError={renderError}
    >
      <App opts={opts} getPlayer={getPlayer} />
    </PlaceHolder>
  )
}

export default hot(module)(Root)
