import React from 'react'
import { Spin } from 'antd'

import { Context } from './PlayerProvider'
import PlayerApp from './PlayerApp'

const Shell = () => (
  <Context.Consumer>
    {({ player }) => {
      if (player) return <PlayerApp player={player} />
      return (
        <div className="shell-spin">
          <Spin tip="Loading..." />
        </div>
      )
    }}
  </Context.Consumer>
)

export default Shell
