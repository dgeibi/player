const webpack = require('webpack')
const path = require('path')
const pkg = require('./package')

const output = path.resolve(__dirname, pkg.dist_dir)

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
