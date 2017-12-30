const BabelMinifyWebpackPlugin = require('babel-minify-webpack-plugin')
const WorkboxBuildWebpackPlugin = require('workbox-webpack-plugin')
const path = require('path')
const webpack = require('webpack')
const { dist } = require('./env')

module.exports = {
  output: {
    publicPath: './',
  },
  plugins: [
    new WorkboxBuildWebpackPlugin({
      globDirectory: path.basename(dist),
      globPatterns: ['**/*.{html,css,json,js}'],
      swDest: path.join(dist, 'sw.js'),
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
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: module => module.context && module.context.includes('node_modules'),
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'antd',
      chunks: ['vendor'],
      minChunks: module => module.context && /antd|rc-/.test(module.context),
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      minChunks: Infinity,
    }),
  ],
}
