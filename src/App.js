import React from 'react'

import PlayerProvider from './components/PlayerProvider'
import Shell from './components/Shell'

export default function App({ playerPromise, audio }) {
  return (
    <PlayerProvider playerPromise={playerPromise} audio={audio}>
      <Shell />
    </PlayerProvider>
  )
}
