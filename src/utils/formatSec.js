const pad = n => (Number(n) < 10 ? `0${n}` : String(n))
const formatSec = s => `${Math.floor(s / 60) || 0}:${pad(Math.floor(s % 60) || 0)}`

export default formatSec
