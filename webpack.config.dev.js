const webpack = require('webpack')
const path = require('path')

const output = path.resolve(__dirname, 'docs')

module.exports = {
  entry: {
    app: ['react-hot-loader/patch', './src/index.js'],
  },
  plugins: [new webpack.NamedModulesPlugin(), new webpack.HotModuleReplacementPlugin()],
  devServer: {
    hot: true,
    contentBase: output,
  },
}
