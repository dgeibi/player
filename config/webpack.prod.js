const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const WorkboxBuildWebpackPlugin = require('workbox-webpack-plugin')
const path = require('path')
const { dist } = require('./env')

module.exports = {
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
    },
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          ie8: false,
          ecma: 8,
          output: {
            comments: false,
            beautify: false,
          },
          warnings: false,
        },
      }),
    ],
  },
  output: {
    publicPath: './',
  },
  plugins: [
    new WorkboxBuildWebpackPlugin({
      globDirectory: path.basename(dist),
      globPatterns: ['**/*.{html,css,json,js}'],
      swDest: path.join(dist, 'sw.js'),
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
  ],
}
