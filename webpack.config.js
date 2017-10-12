const path = require('path')
const webpack = require('webpack')

const output = path.resolve(__dirname, 'docs')
module.exports = {
  devtool: 'source-map',
  entry: {
    app: './src/index.js',
  },
  output: {
    path: output,
    filename: '[name].js',
    publicPath: '/',
    chunkFilename: '[name].bundle.js',
  },
  devServer: {
    hot: true,
    contentBase: output,
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
}
