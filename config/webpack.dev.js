const webpack = require('webpack')
const { dist } = require('./env')

module.exports = {
  devtool: 'cheap-module-source-map',
  plugins: [new webpack.NamedModulesPlugin(), new webpack.HotModuleReplacementPlugin()],
  devServer: {
    hot: true,
    contentBase: dist,
  },
  output: {
    globalObject: 'this', // https://github.com/webpack/webpack/issues/6642
  },
}
