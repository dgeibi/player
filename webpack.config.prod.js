const BabelMinifyWebpackPlugin = require('babel-minify-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const WorkboxBuildWebpackPlugin = require('workbox-webpack-plugin')
const path = require('path')
const pkg = require('./package')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const DIST_DIR = pkg.dist_dir
module.exports = {
  output: {
    publicPath: './',
  },
  resolve: {
    alias: {
      react: 'anujs',
      'react-dom': 'anujs',
      'prop-types': 'anujs/lib/ReactPropTypes',
      'create-react-class': 'anujs/lib/createClass',
    },
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: require.resolve('workbox-sw'),
        to: 'workbox-sw.prod.js',
      },
    ]),
    new CleanWebpackPlugin([DIST_DIR]),
    new WorkboxBuildWebpackPlugin({
      globDirectory: DIST_DIR,
      globPatterns: ['**/*.{html,css,json}', '**/!(workbox-sw.prod).js'],
      swDest: path.join(DIST_DIR, 'sw.js'),
      swSrc: `${__dirname}/src/sw.js`,
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
