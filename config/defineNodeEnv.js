const webpack = require('webpack')

module.exports = v => ({
  plugins: [new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify(v) })],
})
