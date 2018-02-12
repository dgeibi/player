import React from 'react'

import PlayerProvider from './components/PlayerProvider'
import Shell from './components/Shell'

export default function App({ playerPromise }) {
  return (
    <PlayerProvider playerPromise={playerPromise}>
      <Shell />
    </PlayerProvider>
  )
}
