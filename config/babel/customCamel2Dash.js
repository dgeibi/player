const { join } = require('path')

function camel2Dash(_str) {
  const str = _str[0].toLowerCase() + _str.substr(1)
  return str.replace(/([A-Z0-9])/g, $1 => `-${$1.toLowerCase()}`)
}

module.exports = (opts) => {
  const { libraryName, libraryDirectory } = opts
  const customName = transformedMethodName =>
    join(libraryName, libraryDirectory, camel2Dash(transformedMethodName))

  return Object.assign({}, opts, {
    camel2DashComponentName: false,
    customName,
  })
}
