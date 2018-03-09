const webpack = require('webpack')
const { dist } = require('./env')

module.exports = {
  plugins: [new webpack.HotModuleReplacementPlugin()],
  devtool: 'cheap-module-source-map',
  devServer: {
    hot: true,
    contentBase: dist,
  },
  output: {
    globalObject: 'this', // https://github.com/webpack/webpack/issues/6642
  },
}
