const BabelMinifyWebpackPlugin = require('babel-minify-webpack-plugin')
const CopyWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
  output: {
    publicPath: './',
  },
  plugins: [
    new CopyWebpackPlugin(['./docs']),
    new BabelMinifyWebpackPlugin(
      {
        removeConsole: true,
        removeDebugger: true,
      },
      {
        comments: false,
      }
    ),
  ],
}
