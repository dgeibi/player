const BabelMinifyWebpackPlugin = require('babel-minify-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const WorkboxBuildWebpackPlugin = require('workbox-webpack-plugin')
const path = require('path')
const pkg = require('./package')

const DIST_DIR = pkg.dist_dir
module.exports = {
  output: {
    publicPath: './',
  },
  plugins: [
    new CleanWebpackPlugin([DIST_DIR]),
    new WorkboxBuildWebpackPlugin({
      globDirectory: DIST_DIR,
      globPatterns: ['**/*.{html,js,css}'],
      swDest: path.join(DIST_DIR, 'sw.js'),
      skipWaiting: true,
      clientsClaim: true,
    }),
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
