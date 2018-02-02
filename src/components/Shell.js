import React from 'react'
import PropTypes from 'prop-types'
import { Spin } from 'antd'

import PlayerApp from './PlayerApp'

const Shell = (props, { player }) => {
  if (player) return <PlayerApp />
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
