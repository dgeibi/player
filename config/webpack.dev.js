const webpack = require('webpack')
const { dist } = require('./env')

module.exports = {
  plugins: [new webpack.NamedModulesPlugin(), new webpack.HotModuleReplacementPlugin()],
  devServer: {
    hot: true,
    contentBase: dist,
  },
}
