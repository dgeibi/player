import React from 'react'
import PlayerApp from './components/PlayerApp'
import PlayerProvider, { Context } from './components/PlayerProvider'

export default function App({ createPlayer }) {
  return (
    <PlayerProvider player={createPlayer()}>
      <Context.Consumer>{({ player }) => <PlayerApp player={player} />}</Context.Consumer>
    </PlayerProvider>
  )
}
