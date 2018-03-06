import createPlayer from './createPlayer'
import { createLoader } from './components/PlaceHolder'

export default createLoader(createPlayer, () => 'one')
