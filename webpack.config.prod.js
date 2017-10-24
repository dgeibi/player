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
  resolve: {
    alias: {
      react: 'anujs',
      'react-dom': 'anujs',
      'prop-types': 'anujs/lib/ReactPropTypes',
      'create-react-class': 'anujs/lib/createClass',
    },
  },
  plugins: [
    new CleanWebpackPlugin([DIST_DIR]),
    new WorkboxBuildWebpackPlugin({
      globDirectory: DIST_DIR,
      globPatterns: ['**/*.{html,css,json,js}'],
      swDest: path.join(DIST_DIR, 'sw.js'),
      clientsClaim: true,
      skipWaiting: true,
      runtimeCaching: [
        {
          urlPattern: /.*\.(woff|woff2|eot|ttf|svg)$/,
          handler: 'cacheFirst',
          options: {
            cacheName: 'assets',
            cacheExpiration: {
              maxEntries: 10,
            },
          },
        },
      ],
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
