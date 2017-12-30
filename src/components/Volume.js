import React from 'react'
import { Volume, Volume1, Volume2, VolumeX } from 'react-feather'
import PropTypes from 'prop-types'

const V = ({ volume, muted, size }) => {
  let Type = null
  if (muted) {
    Type = VolumeX
  } else {
    const v = Number(volume)
    if (v <= 0) {
      Type = Volume
    } else if (v <= 0.5) {
      Type = Volume1
    } else {
      Type = Volume2
    }
  }
  return <Type size={size} />
}

V.propTypes = {
  muted: PropTypes.bool.isRequired,
  volume: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
}

export default V
