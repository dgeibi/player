const BabelMinifyWebpackPlugin = require('babel-minify-webpack-plugin')

module.exports = {
  plugins: [
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
