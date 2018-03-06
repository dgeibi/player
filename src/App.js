import React from 'react'
import PlayerApp from './components/PlayerApp'
import PlayerProvider, { Context } from './components/PlayerProvider'

function App({ opts, getPlayer }) {
  return (
    <PlayerProvider player={getPlayer(opts)}>
      <Context.Consumer>{({ player }) => <PlayerApp player={player} />}</Context.Consumer>
    </PlayerProvider>
  )
}

export default App
