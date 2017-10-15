import React from 'react'
import { Volume, Volume1, Volume2, VolumeX } from 'react-feather'
import PropTypes from 'prop-types'

const V = ({ volume, muted }) => {
  if (muted) return <VolumeX />
  const v = Number(volume)
  if (v <= 0) return <Volume />
  if (v <= 0.5) return <Volume1 />
  return <Volume2 />
}

V.propTypes = {
  muted: PropTypes.bool.isRequired,
  volume: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
}

export default V
