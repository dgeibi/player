const merge = require('webpack-merge')
const webpack = require('webpack')

const css = require('./helpers/css')
const analyzer = require('./helpers/analyzer')
const plugin = require('./helpers/plugin')
const base = require('./webpack.base')
const { src } = require('./env')

const defaultInclude = src

module.exports = (env = {}) => {
  const isProduction = env.production === true
  const nodeEnv = !isProduction ? 'development' : 'production'
  process.env.NODE_ENV = nodeEnv

  return merge([
    base,
    env.react || {
      resolve: {
        alias: {
          react: 'anujs',
          'react-dom': 'anujs',
          'create-react-class': 'anujs/lib/createClass',
          'prop-types': 'anujs/lib/ReactPropTypes',
        },
      },
    },
    plugin(
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(nodeEnv),
        'process.env.REACT': env.react ? 'true' : 'false',
      })
    ),
    css({
      rule: {
        test: /\.css$/,
        use: [
          {
            loader: 'css-loader',
            options: {
              minimize: true,
            },
          },
        ],
      },
      extract: true,
      extractOptions: 'antd.css',
    }),
    css({
      rule: {
        test: /\.scss$/,
        include: defaultInclude,
        use: [
          {
            loader: 'css-loader',
            options: {
              minimize: true,
              sourceMap: true,
              importLoaders: 1,
            },
          },
          { loader: 'postcss-loader', options: { sourceMap: true } },
        ],
      },
      extract: isProduction,
      extractOptions: 'main.css',
    }),
    analyzer(env.analyzer),
    isProduction ? require('./webpack.prod') : require('./webpack.dev'),
  ])
}
