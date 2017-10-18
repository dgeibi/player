import React from 'react'
import PropTypes from 'prop-types'
import { Spin } from 'antd'

import App from './App'

const Shell = (props, { player }) => {
  if (player) return <App />
  return (
    <div className="shell-spin">
      <Spin tip="Loading..." />
    </div>
  )
}
Shell.contextTypes = {
  player: PropTypes.object,
}

export default Shell
