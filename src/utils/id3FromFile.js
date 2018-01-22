import { parse } from 'id3-parser'
import { convertFileToBuffer } from 'id3-parser/lib/universal/helpers'

export default function parseFile(file) {
  return convertFileToBuffer(file).then(parse)
}
